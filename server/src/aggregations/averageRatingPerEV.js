import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

/**
 * AGGREGATION PIPELINE 1: Average Rating and Sub-Category Breakdown Per EV
 * 
 * Purpose:
 * Computes overall average rating, total review count, and granular averages for:
 * - Real-world Range satisfaction
 * - Ride Comfort
 * - Charging Experience
 * - Build Quality
 * - Value for Money
 * 
 * DBMS Justification:
 * Uses $match on published moderation status, then $group with $avg and $sum accumulators.
 * Used during review recalculations and analytics reporting.
 */
export async function getAverageRatingPerEV(evId) {
  const matchStage = {
    moderationStatus: 'published',
  };

  if (evId) {
    matchStage.evId = new mongoose.Types.ObjectId(evId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$evId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgRangeScore: { $avg: '$categoryRatings.range' },
        avgComfortScore: { $avg: '$categoryRatings.comfort' },
        avgChargingScore: { $avg: '$categoryRatings.chargingExperience' },
        avgBuildQualityScore: { $avg: '$categoryRatings.buildQuality' },
        avgValueForMoneyScore: { $avg: '$categoryRatings.valueForMoney' },
        avgOwnerReportedRange: { $avg: '$ownerReportedRealWorldRangeKm' },
        verifiedOwnerReviews: {
          $sum: { $cond: [{ $eq: ['$isVerifiedOwner', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 1,
        averageRating: { $round: ['$averageRating', 2] },
        totalReviews: 1,
        verifiedOwnerReviews: 1,
        categoryAverages: {
          range: { $round: ['$avgRangeScore', 2] },
          comfort: { $round: ['$avgComfortScore', 2] },
          chargingExperience: { $round: ['$avgChargingScore', 2] },
          buildQuality: { $round: ['$avgBuildQualityScore', 2] },
          valueForMoney: { $round: ['$avgValueForMoneyScore', 2] },
        },
        avgOwnerReportedRange: { $round: ['$avgOwnerReportedRange', 1] },
      },
    },
  ];

  return Review.aggregate(pipeline);
}
