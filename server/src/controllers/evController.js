import mongoose from 'mongoose';
import { EV } from '../models/EV.js';
import { Brand } from '../models/Brand.js';

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
      query.has360Model = true;
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
