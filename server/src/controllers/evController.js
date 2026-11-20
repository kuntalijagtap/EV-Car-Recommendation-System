import mongoose from 'mongoose';
import { EV } from '../models/EV.js';
import { Brand } from '../models/Brand.js';
import { Review } from '../models/Review.js';

/**
 * @desc    Get all EVs with advanced filtering, full-text search, sorting, and pagination
 * @route   GET /api/evs
 * @access  Public
 */
export async function getEVs(req, res, next) {
  try {
    const {
      search,
      brand,
      bodyType,
      minPrice,
      maxPrice,
      minRange,
      minBattery,
      maxChargingTime,
      seats,
      has360,
      sortBy = 'rating_desc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Text Search across Name, Variant, and Features
    if (search && search.trim()) {
      const sanitized = search.trim();
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { variant: { $regex: sanitized, $options: 'i' } },
        { features: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // 2. Brand Filtering (ID or Name)
    if (brand) {
      const brandIds = [];
      const brandNames = brand.split(',').map((b) => b.trim());

      // Find matching brand ObjectIds
      const matchingBrands = await Brand.find({
        $or: [
          { _id: { $in: brandNames.filter((b) => mongoose.Types.ObjectId.isValid(b)) } },
          { name: { $in: brandNames.map((n) => new RegExp(n, 'i')) } },
        ],
      });

      if (matchingBrands.length > 0) {
        query.brandId = { $in: matchingBrands.map((b) => b._id) };
      }
    }

    // 3. Body Type Filtering
    if (bodyType) {
      const types = bodyType.split(',').map((t) => t.trim());
      query.bodyType = { $in: types };
    }

    // 4. Price Boundaries (INR)
    if (minPrice || maxPrice) {
      query['price.exShowroom'] = {};
      if (minPrice) query['price.exShowroom'].$gte = Number(minPrice);
      if (maxPrice) query['price.exShowroom'].$lte = Number(maxPrice);
    }

    // 5. Claimed Range (km)
    if (minRange) {
      query['range.claimedNedc'] = { $gte: Number(minRange) };
    }

    // 6. Battery Capacity (kWh)
    if (minBattery) {
      query['battery.capacityKwh'] = { $gte: Number(minBattery) };
    }

    // 7. Max DC Fast Charging Time (Minutes)
    if (maxChargingTime) {
      query['charging.dcFastChargingTimeMinutes'] = { $lte: Number(maxChargingTime) };
    }

    // 8. Seating Capacity
    if (seats) {
      const seatArr = seats.split(',').map(Number);
      query['dimensions.seatingCapacity'] = { $in: seatArr };
    }

    // 9. Flagship 360 Visualizer Filter
    if (has360 === 'true' || has360 === true) {
      query['view360Frames.1'] = { $exists: true };
    }

    // 10. Sorting Strategy
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions = { 'price.exShowroom': 1 };
        break;
      case 'price_desc':
        sortOptions = { 'price.exShowroom': -1 };
        break;
      case 'range_desc':
        sortOptions = { 'range.claimedNedc': -1 };
        break;
      case 'rating_desc':
        sortOptions = {
          'ratingAggregates.averageRating': -1,
          'ratingAggregates.totalReviews': -1,
        };
        break;
      case 'views_desc':
        sortOptions = { viewCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = {
          'ratingAggregates.averageRating': -1,
          'price.exShowroom': 1,
        };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [totalCount, evs] = await Promise.all([
      EV.countDocuments(query),
      EV.find(query)
        .populate('brandId', 'name logoUrl originCountry')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit),
    ]);

    const totalPages = Math.ceil(totalCount / pageLimit);

    res.status(200).json({
      success: true,
      count: evs.length,
      totalCount,
      totalPages,
      currentPage: pageNum,
      data: evs,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single EV by ID with populated brand details and atomically increment views
 * @route   GET /api/evs/:id
 * @access  Public
 */
export async function getEVById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid vehicle ID format.' });
    }

    // Atomically increment viewCount on read
    const ev = await EV.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('brandId', 'name logoUrl originCountry website supportContact');

    if (!ev) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.status(200).json({
      success: true,
      data: ev,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get a small set of published owner reviews for the homepage
 * @route   GET /api/evs/reviews/featured
 * @access  Public
 */
export async function getFeaturedReviews(req, res, next) {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 3;
    const limit = Math.min(6, Math.max(1, requestedLimit));
    const reviews = await Review.find({ moderationStatus: 'published' })
      .populate({ path: 'evId', select: 'name imageUrl' })
      .populate({ path: 'userId', select: 'name' })
      .sort({ createdAt: -1, isVerifiedOwner: -1, helpfulCount: -1 })
      .limit(limit)
      .lean();

    const data = reviews
      .filter((review) => review.evId)
      .map((review) => ({
        _id: review._id,
        title: review.title,
        body: review.body,
        rating: review.rating,
        city: review.city,
        monthsOwned: review.monthsOwned,
        isVerifiedOwner: review.isVerifiedOwner,
        author: review.userId?.name || 'EV owner',
        ev: review.evId,
      }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Compare two to four EVs by ID
 * @route   GET /api/evs/compare?ids=id1,id2
 * @access  Public
 */
export async function compareEVs(req, res, next) {
  try {
    const ids = typeof req.query.ids === 'string'
      ? req.query.ids.split(',').map((id) => id.trim())
      : [];

    if (ids.length < 2 || ids.length > 4 || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        message: 'Provide two to four valid EV IDs in the ids query parameter.',
      });
    }

    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ success: false, message: 'EV IDs must be unique.' });
    }

    const vehicles = await EV.find({ _id: { $in: ids } })
      .populate('brandId', 'name logoUrl originCountry');
    const vehiclesById = new Map(vehicles.map((ev) => [ev._id.toString(), ev]));
    const orderedVehicles = ids.map((id) => vehiclesById.get(id)).filter(Boolean);

    if (orderedVehicles.length !== ids.length) {
      return res.status(404).json({ success: false, message: 'One or more vehicles were not found.' });
    }

    res.status(200).json({
      success: true,
      count: orderedVehicles.length,
      data: orderedVehicles,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComparisonVariants(req, res, next) {
  try {
    const ids = typeof req.query.ids === 'string' ? req.query.ids.split(',').map((id) => id.trim()).filter((id) => mongoose.Types.ObjectId.isValid(id)).slice(0, 4) : [];
    const selected = await EV.find({ _id: { $in: ids } }).select('name brandId variant price battery range').lean();
    const data = await Promise.all(selected.map(async (ev) => {
      const variants = await EV.find({ brandId: ev.brandId, name: ev.name })
        .select('name variant price battery range charging performance dimensions')
        .sort({ 'price.exShowroom': 1 }).lean();
      return { evId: String(ev._id), name: ev.name, brandId: String(ev.brandId), variants };
    }));
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

/**
 * @desc    Get catalog metadata for dynamic filter slider bounds
 * @route   GET /api/evs/metadata/filters
 * @access  Public
 */
export async function getCatalogMetadata(req, res, next) {
  try {
    const [priceRange, rangeRange, batteryRange, bodyTypes, brands] = await Promise.all([
      EV.aggregate([
        { $match: { 'price.exShowroom': { $ne: null } } },
        {
          $group: {
            _id: null,
            min: { $min: '$price.exShowroom' },
            max: { $max: '$price.exShowroom' },
          },
        },
      ]),
      EV.aggregate([
        { $match: { 'range.claimedNedc': { $ne: null } } },
        {
          $group: {
            _id: null,
            min: { $min: '$range.claimedNedc' },
            max: { $max: '$range.claimedNedc' },
          },
        },
      ]),
      EV.aggregate([
        { $match: { 'battery.capacityKwh': { $ne: null } } },
        {
          $group: {
            _id: null,
            min: { $min: '$battery.capacityKwh' },
            max: { $max: '$battery.capacityKwh' },
          },
        },
      ]),
      EV.distinct('bodyType', { bodyType: { $ne: null } }),
      Brand.find().select('name logoUrl activeEvCount').sort({ name: 1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        price: priceRange[0] || { min: 800000, max: 8000000 },
        range: rangeRange[0] || { min: 200, max: 700 },
        battery: batteryRange[0] || { min: 15, max: 90 },
        bodyTypes: bodyTypes.sort(),
        brands,
      },
    });
  } catch (error) {
    next(error);
  }
}
