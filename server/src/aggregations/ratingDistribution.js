import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

/**
 * AGGREGATION PIPELINE 3: Rating Distribution Histogram (1 to 5 Stars)
 * 
 * Purpose:
 * Groups reviews by individual star rating (1, 2, 3, 4, 5) to power frontend rating bars
 * on EV detail pages.
 * 
 * DBMS Justification:
 * Uses $facet to compute total reviews and bucketed star counts in a single round-trip.
 */
export async function getRatingDistribution(evId) {
  const matchStage = {
    moderationStatus: 'published',
  };

  if (evId) {
    matchStage.evId = new mongoose.Types.ObjectId(evId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        stars: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgRating: { $avg: '$rating' },
            },
          },
        ],
      },
    },
    {
      $project: {
        stars: 1,
        total: { $arrayElemAt: ['$summary.total', 0] },
        avgRating: { $round: [{ $arrayElemAt: ['$summary.avgRating', 0] }, 2] },
      },
    },
  ];

  const results = await Review.aggregate(pipeline);
  const data = results[0] || { stars: [], total: 0, avgRating: 0 };

  // Ensure all 5 stars are represented in order: 5, 4, 3, 2, 1
  const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  (data.stars || []).forEach((item) => {
    map[item._id] = item.count;
  });

  return {
    total: data.total || 0,
    averageRating: data.avgRating || 0,
    breakdown: [
      { stars: 5, count: map[5], percentage: data.total ? Math.round((map[5] / data.total) * 100) : 0 },
      { stars: 4, count: map[4], percentage: data.total ? Math.round((map[4] / data.total) * 100) : 0 },
      { stars: 3, count: map[3], percentage: data.total ? Math.round((map[3] / data.total) * 100) : 0 },
      { stars: 2, count: map[2], percentage: data.total ? Math.round((map[2] / data.total) * 100) : 0 },
      { stars: 1, count: map[1], percentage: data.total ? Math.round((map[1] / data.total) * 100) : 0 },
    ],
  };
}
