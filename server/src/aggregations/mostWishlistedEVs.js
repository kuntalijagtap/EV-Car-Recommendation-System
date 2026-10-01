import { Wishlist } from '../models/Wishlist.js';

/**
 * AGGREGATION PIPELINE 4: Most Wishlisted Electric Vehicles
 * 
 * Purpose:
 * Computes platform-wide demand analytics by counting how many distinct users
 * have saved each vehicle to their personal wishlist.
 * 
 * DBMS Justification:
 * Operates across the M:N junction collection `wishlists`.
 * Uses $group on evId, $sort on descending count, and $lookup to join EV and Brand data.
 */
export async function getMostWishlistedEVs(limit = 10) {
  const pipeline = [
    {
      $group: {
        _id: '$evId',
        wishlistCount: { $sum: 1 },
      },
    },
    {
      $sort: { wishlistCount: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'evs',
        localField: '_id',
        foreignField: '_id',
        as: 'ev',
      },
    },
    { $unwind: '$ev' },
    {
      $lookup: {
        from: 'brands',
        localField: 'ev.brandId',
        foreignField: '_id',
        as: 'brand',
      },
    },
    { $unwind: '$brand' },
    {
      $project: {
        _id: '$ev._id',
        name: '$ev.name',
        variant: '$ev.variant',
        bodyType: '$ev.bodyType',
        price: '$ev.price.exShowroom',
        claimedNedcRange: '$ev.range.claimedNedc',
        averageRating: '$ev.ratingAggregates.averageRating',
        imageUrl: '$ev.imageUrl',
        brandName: '$brand.name',
        brandLogo: '$brand.logoUrl',
        wishlistCount: 1,
      },
    },
  ];

  return Wishlist.aggregate(pipeline);
}
