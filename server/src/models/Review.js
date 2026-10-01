import mongoose from 'mongoose';

/**
 * Review Schema
 * Normalized 1:N reference target for EV and User.
 * RATIONALE (Reference instead of Embed):
 * Reviews grow unboundedly over the lifecycle of a vehicle. Embedding reviews inside
 * the EV document would violate the 16MB MongoDB BSON document ceiling and trigger
 * frequent memory reallocation on disk during high-concurrency write operations.
 */
const reviewSchema = new mongoose.Schema(
  {
    evId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EV',
      required: [true, 'EV reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: 1,
      max: 5,
    },
    categoryRatings: {
      range: { type: Number, required: true, min: 1, max: 5 },
      comfort: { type: Number, required: true, min: 1, max: 5 },
      chargingExperience: { type: Number, required: true, min: 1, max: 5 },
      buildQuality: { type: Number, required: true, min: 1, max: 5 },
      valueForMoney: { type: Number, required: true, min: 1, max: 5 },
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      minlength: 10,
      maxlength: 3000,
    },
    pros: [{ type: String }],
    cons: [{ type: String }],
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    monthsOwned: {
      type: Number,
      required: [true, 'Months owned is required'],
      min: 0,
    },
    ownerReportedRealWorldRangeKm: {
      type: Number,
      required: [true, 'Owner-reported range is required'],
      min: 20,
      max: 1200,
    },
    isVerifiedOwner: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
    moderationStatus: {
      type: String,
      enum: ['published', 'hidden', 'flagged'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ evId: 1, moderationStatus: 1, createdAt: -1 });
reviewSchema.index({ evId: 1, helpfulCount: -1 });
reviewSchema.index({ title: 'text', body: 'text', pros: 'text', cons: 'text' });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
