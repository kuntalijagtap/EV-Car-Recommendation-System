import { EV } from '../models/EV.js';

/**
 * AGGREGATION PIPELINE 2: Top-Rated EV Per Brand
 * 
 * Purpose:
 * Identifies the flagship highest-rated electric vehicle for each manufacturer.
 * 
 * DBMS Justification:
 * Uses $lookup to join normalized Brands, sorts by denormalized rating aggregates,
 * and uses $group with $first accumulator to pick the leader per brand.
 */
export async function getTopRatedEVPerBrand() {
  const pipeline = [
    {
      $match: {
        'ratingAggregates.totalReviews': { $gte: 1 },
      },
    },
    {
      $sort: {
        'ratingAggregates.averageRating': -1,
        'ratingAggregates.totalReviews': -1,
      },
    },
    {
      $group: {
        _id: '$brandId',
        topEvId: { $first: '$_id' },
        name: { $first: '$name' },
        variant: { $first: '$variant' },
        bodyType: { $first: '$bodyType' },
        price: { $first: '$price.exShowroom' },
        claimedNedcRange: { $first: '$range.claimedNedc' },
        averageRating: { $first: '$ratingAggregates.averageRating' },
        totalReviews: { $first: '$ratingAggregates.totalReviews' },
        imageUrl: { $first: '$imageUrl' },
      },
    },
    {
      $lookup: {
        from: 'brands',
        localField: '_id',
        foreignField: '_id',
        as: 'brand',
      },
    },
    { $unwind: '$brand' },
    {
      $project: {
        _id: '$topEvId',
        brandId: '$brand._id',
        brandName: '$brand.name',
        brandLogo: '$brand.logoUrl',
        originCountry: '$brand.originCountry',
        evName: '$name',
        variant: 1,
        bodyType: 1,
        price: 1,
        claimedNedcRange: 1,
        averageRating: 1,
        totalReviews: 1,
        imageUrl: 1,
      },
    },
    {
      $sort: { averageRating: -1 },
    },
  ];

  return EV.aggregate(pipeline);
}
