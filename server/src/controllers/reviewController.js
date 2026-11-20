import mongoose from 'mongoose';
import { EV } from '../models/EV.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';

async function refreshEVRating(evId) {
  const [stats] = await Review.aggregate([
    { $match: { evId: new mongoose.Types.ObjectId(evId), moderationStatus: 'published' } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 },
      range: { $avg: '$categoryRatings.range' },
      comfort: { $avg: '$categoryRatings.comfort' },
      chargingExperience: { $avg: '$categoryRatings.chargingExperience' },
      buildQuality: { $avg: '$categoryRatings.buildQuality' },
      valueForMoney: { $avg: '$categoryRatings.valueForMoney' },
    } },
  ]);
  const round = (value) => value == null ? 0 : Math.round(value * 10) / 10;
  await EV.updateOne({ _id: evId }, { $set: { ratingAggregates: {
    averageRating: round(stats?.averageRating),
    totalReviews: stats?.totalReviews || 0,
    categoryAverages: {
      range: round(stats?.range), comfort: round(stats?.comfort),
      chargingExperience: round(stats?.chargingExperience),
      buildQuality: round(stats?.buildQuality), valueForMoney: round(stats?.valueForMoney),
    },
  } } });
}

export async function listEVReviews(req, res, next) {
  try {
    const { evId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(evId)) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 6));
    const filter = { evId, moderationStatus: 'published' };
    const [totalCount, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter).populate('userId', 'name').sort({ createdAt: -1, isVerifiedOwner: -1, helpfulCount: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    res.json({ success: true, totalCount, page, totalPages: Math.ceil(totalCount / limit), data: reviews.map((review) => ({ ...review, author: review.userId?.name || 'EV owner' })) });
  } catch (error) { next(error); }
}

export async function createEVReview(req, res, next) {
  try {
    const { evId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(evId) || !(await EV.exists({ _id: evId }))) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    if (await Review.exists({ evId, userId: req.user._id })) return res.status(409).json({ success: false, message: 'You have already submitted a review for this EV.' });
    const review = await Review.create({
      evId,
      userId: req.user._id,
      rating: req.body.rating,
      categoryRatings: req.body.categoryRatings,
      title: req.body.title,
      body: req.body.body,
      city: req.body.city || req.user.profile?.city || 'Not provided',
      monthsOwned: req.body.monthsOwned,
      ownerReportedRealWorldRangeKm: req.body.ownerReportedRealWorldRangeKm,
      isVerifiedOwner: false,
      moderationStatus: 'published',
    });
    await refreshEVRating(evId);
    res.status(201).json({ success: true, message: 'Review published and will appear in the EVora owner reviews.', data: review });
  } catch (error) { next(error); }
}

export async function listReviewsForAdmin(req, res, next) {
  try {
    const allowed = ['pending', 'published', 'hidden', 'flagged'];
    const status = allowed.includes(req.query.status) ? req.query.status : 'pending';
    const reviews = await Review.find({ moderationStatus: status })
      .populate('evId', 'name variant')
      .populate('userId', 'name email')
      .sort({ createdAt: 1 }).limit(100).lean();
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
}

export async function getAdminOverview(req, res, next) {
  try {
    const statuses = ['pending', 'published', 'flagged', 'hidden'];
    const [users, evs, sampleEvs, missingSources, reviewCounts] = await Promise.all([
      User.countDocuments(),
      EV.countDocuments(),
      EV.countDocuments({ isSampleData: true }),
      EV.countDocuments({ $or: [{ dataSourceUrl: null }, { priceVerifiedAt: null }, { specsVerifiedAt: null }] }),
      Review.aggregate([{ $group: { _id: '$moderationStatus', count: { $sum: 1 } } }]),
    ]);
    const reviews = Object.fromEntries(statuses.map((status) => [status, 0]));
    reviewCounts.forEach(({ _id, count }) => { if (_id in reviews) reviews[_id] = count; });
    res.json({ success: true, data: { users, evs, sampleEvs, needsSourceOrVerification: missingSources, reviews } });
  } catch (error) { next(error); }
}

export async function listCatalogNeedsReview(req, res, next) {
  try {
    const items = await EV.find({ $or: [{ dataSourceUrl: null }, { priceVerifiedAt: null }, { specsVerifiedAt: null }] })
      .populate('brandId', 'name').select('name variant brandId price range battery performance charging imageUrl images imageProvidedByDataset dataSourceUrl priceVerifiedAt specsVerifiedAt isSampleData')
      .sort({ updatedAt: -1 }).limit(50).lean();
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
}

export async function verifyCatalogRecord(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.evId)) return res.status(404).json({ success: false, message: 'EV record not found.' });
    const { dataSourceUrl, verifyPrice, verifySpecs } = req.body;
    if (typeof verifyPrice !== 'boolean' || typeof verifySpecs !== 'boolean' || (!verifyPrice && !verifySpecs)) {
      return res.status(400).json({ success: false, message: 'Select whether you verified the price, specifications, or both.' });
    }
    if (!dataSourceUrl?.trim()) return res.status(400).json({ success: false, message: 'Add the source URL used to check this record.' });
    let source;
    try { source = new URL(dataSourceUrl.trim()); } catch { return res.status(400).json({ success: false, message: 'Enter a valid source URL.' }); }
    if (!['http:', 'https:'].includes(source.protocol)) return res.status(400).json({ success: false, message: 'Source must use HTTP or HTTPS.' });
    const set = {};
    if (source) set.dataSourceUrl = source.toString();
    if (verifyPrice) set.priceVerifiedAt = new Date();
    if (verifySpecs) set.specsVerifiedAt = new Date();
    const ev = await EV.findByIdAndUpdate(req.params.evId, { $set: set }, { new: true }).populate('brandId', 'name');
    if (!ev) return res.status(404).json({ success: false, message: 'EV record not found.' });
    res.json({ success: true, data: ev });
  } catch (error) { next(error); }
}

export async function moderateReview(req, res, next) {
  try {
    const { status, note = '' } = req.body;
    if (!['pending', 'published', 'hidden', 'flagged'].includes(status)) return res.status(400).json({ success: false, message: 'Choose a valid moderation status.' });
    if (!mongoose.Types.ObjectId.isValid(req.params.reviewId)) return res.status(404).json({ success: false, message: 'Review not found.' });
    const review = await Review.findByIdAndUpdate(req.params.reviewId, {
      $set: { moderationStatus: status, moderationNote: String(note).slice(0, 300), moderatedBy: req.user._id },
    }, { new: true }).populate('evId', 'name variant').populate('userId', 'name email');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    await refreshEVRating(review.evId._id);
    res.json({ success: true, data: review });
  } catch (error) { next(error); }
}
