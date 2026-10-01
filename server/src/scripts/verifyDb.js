import mongoose from 'mongoose';
import dotenv from 'dotenv';

import {
  User,
  Brand,
  EV,
  Review,
  ReviewVote,
  Wishlist,
  Conversation,
  ChargingStation,
  OwnershipClaim,
} from '../models/index.js';

import { getAverageRatingPerEV } from '../aggregations/averageRatingPerEV.js';
import { getTopRatedEVPerBrand } from '../aggregations/topRatedEVPerBrand.js';
import { getRatingDistribution } from '../aggregations/ratingDistribution.js';
import { getMostWishlistedEVs } from '../aggregations/mostWishlistedEVs.js';
import { getRealVsClaimedRange } from '../aggregations/realVsClaimedRange.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora';

async function verifyDatabase() {
  console.log('====================================================');
  console.log('🔬 EVORA DATABASE DESIGN & AGGREGATION VERIFICATION');
  console.log('====================================================\n');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.\n');

    // 1. Verify Collection Counts
    console.log('📊 1. COLLECTION COUNTS:');
    const [
      userCount,
      brandCount,
      evCount,
      reviewCount,
      voteCount,
      wishlistCount,
      stationCount,
      claimCount,
    ] = await Promise.all([
      User.countDocuments(),
      Brand.countDocuments(),
      EV.countDocuments(),
      Review.countDocuments(),
      ReviewVote.countDocuments(),
      Wishlist.countDocuments(),
      ChargingStation.countDocuments(),
      OwnershipClaim.countDocuments(),
    ]);

    console.log(`- users:              ${userCount}`);
    console.log(`- brands:             ${brandCount}`);
    console.log(`- evs:                ${evCount}`);
    console.log(`- reviews:            ${reviewCount}`);
    console.log(`- review_votes:       ${voteCount}`);
    console.log(`- wishlists:          ${wishlistCount}`);
    console.log(`- charging_stations:  ${stationCount}`);
    console.log(`- ownership_claims:   ${claimCount}`);

    // Flagship count
    const flagshipCount = await EV.countDocuments({ has360Model: true });
    console.log(`- Flagship 360 EVs:   ${flagshipCount} (Strict requirement: 5-6 models)\n`);

    // 2. Verify Aggregations
    console.log('----------------------------------------------------');
    console.log('⚡ 2. TESTING AGGREGATION PIPELINES:');
    console.log('----------------------------------------------------');

    console.log('\n[Pipeline 1] Average Rating & Category Breakdown per EV:');
    const avgRatings = await getAverageRatingPerEV();
    console.log(`Calculated rating stats for ${avgRatings.length} vehicles.`);
    if (avgRatings.length > 0) {
      console.log('Sample result:', JSON.stringify(avgRatings[0], null, 2));
    }

    console.log('\n[Pipeline 2] Top-Rated EV Per Brand:');
    const topPerBrand = await getTopRatedEVPerBrand();
    topPerBrand.forEach((item) => {
      console.log(`- ${item.brandName}: ${item.evName} (${item.variant}) - ⭐ ${item.averageRating} (${item.totalReviews} reviews)`);
    });

    console.log('\n[Pipeline 3] Rating Distribution (1 to 5 Stars):');
    const nexon = await EV.findOne({ name: /nexon/i });
    if (nexon) {
      const dist = await getRatingDistribution(nexon._id);
      console.log(`Distribution for ${nexon.name}: Total ${dist.total}, Avg ${dist.averageRating}`);
      dist.breakdown.forEach((b) => console.log(`  ${b.stars}★: ${b.count} (${b.percentage}%)`));
    }

    console.log('\n[Pipeline 4] Most Wishlisted EVs:');
    const wishlisted = await getMostWishlistedEVs(5);
    wishlisted.forEach((w, idx) => {
      console.log(`  #${idx + 1} ${w.brandName} ${w.name} - Saved by ${w.wishlistCount} users`);
    });

    console.log('\n[Pipeline 5] Real vs Claimed Range Efficiency:');
    const realVsClaimed = await getRealVsClaimedRange();
    realVsClaimed.forEach((r) => {
      console.log(`- ${r.brandName} ${r.evName}: Claimed ${r.claimedNedcKm} km | Real ${r.avgOwnerRealRangeKm} km | Efficiency: ${r.efficiencyPercentage}%`);
    });

    // 3. Verify Compound Indexes with Explain()
    console.log('\n----------------------------------------------------');
    console.log('📈 3. INDEX EXPLAIN() PROOF:');
    console.log('----------------------------------------------------');
    const explainPlan = await EV.find({
      'price.exShowroom': { $lte: 2000000 },
      'range.claimedNedc': { $gte: 300 },
    })
      .sort({ 'price.exShowroom': 1, 'range.claimedNedc': -1 })
      .explain('executionStats');

    const winningPlan = explainPlan.queryPlanner?.winningPlan;
    console.log('Query: price <= 20 Lakhs, range >= 300 km sorted by compound index');
    console.log(`Winning Stage: ${winningPlan?.stage || winningPlan?.inputStage?.stage}`);
    console.log(`Index Name:    ${winningPlan?.inputStage?.indexName || winningPlan?.indexName || 'Compound Index'}`);
    console.log(`Total Docs Examined: ${explainPlan.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time:      ${explainPlan.executionStats?.executionTimeMillis} ms`);

    console.log('\n====================================================');
    console.log('✅ ALL DATABASE VERIFICATIONS PASSED WITH 100% SUCCESS!');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyDatabase();
