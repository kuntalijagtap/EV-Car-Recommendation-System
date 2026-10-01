import { Brand } from '../models/Brand.js';
import { EV } from '../models/EV.js';

/**
 * @desc    Get all brands with active EV counts
 * @route   GET /api/brands
 * @access  Public
 */
export async function getBrands(req, res, next) {
  try {
    const brands = await Brand.find().sort({ name: 1 });

    // Count vehicles per brand
    const evCounts = await EV.aggregate([
      { $group: { _id: '$brandId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    evCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const brandsWithCounts = brands.map((b) => ({
      _id: b._id,
      name: b.name,
      originCountry: b.originCountry,
      logoUrl: b.logoUrl,
      website: b.website,
      description: b.description,
      activeEvCount: countMap[b._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: brandsWithCounts.length,
      data: brandsWithCounts,
    });
  } catch (error) {
    next(error);
  }
}
