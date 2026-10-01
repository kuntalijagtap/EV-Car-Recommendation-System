import { Review } from '../models/Review.js';

/**
 * AGGREGATION PIPELINE 5: Owner-Reported Real Range vs Claimed NEDC Range
 * 
 * Purpose:
 * Analyzes empirical telemetry submitted by verified and community owners,
 * comparing actual driving range against official ARAI/NEDC claimed specs.
 * 
 * DBMS Justification:
 * Uses $match on positive owner telemetry, $group by evId with $avg,
 * joins `evs` collection with $lookup, and uses $project with arithmetic expressions
 * ($subtract, $divide, $multiply) to calculate real-world deviation percentages.
 */
export async function getRealVsClaimedRange() {
  const pipeline = [
    {
      $match: {
        moderationStatus: 'published',
        ownerReportedRealWorldRangeKm: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: '$evId',
        avgOwnerRealRange: { $avg: '$ownerReportedRealWorldRangeKm' },
        ownerReportCount: { $sum: 1 },
        minReportedRange: { $min: '$ownerReportedRealWorldRangeKm' },
        maxReportedRange: { $max: '$ownerReportedRealWorldRangeKm' },
      },
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
        evName: '$ev.name',
        variant: '$ev.variant',
        brandName: '$brand.name',
        claimedNedcKm: '$ev.range.claimedNedc',
        avgOwnerRealRangeKm: { $round: ['$avgOwnerRealRange', 1] },
        minReportedRangeKm: '$minReportedRange',
        maxReportedRangeKm: '$maxReportedRange',
        ownerReportCount: 1,
        // Range Retention Efficiency Percentage: (Real / Claimed) * 100
        efficiencyPercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$avgOwnerRealRange', '$ev.range.claimedNedc'] },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
    {
      $sort: { efficiencyPercentage: -1 },
    },
  ];

  return Review.aggregate(pipeline);
}
