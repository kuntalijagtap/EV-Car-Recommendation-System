import mongoose from 'mongoose';

/**
 * ReviewVote Schema
 * Junction collection between User and Review.
 * RATIONALE:
 * Prevents fraudulent double-voting and eliminates write contention on the review
 * document. Enforced at the MongoDB engine layer via unique compound index (userId, reviewId).
 */
const reviewVoteSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    voteType: {
      type: String,
      enum: ['helpful', 'unhelpful'],
      required: true,
    },
  },
  { timestamps: true }
);

// Strict unique constraint: one vote per user per review
reviewVoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

export const ReviewVote = mongoose.model('ReviewVote', reviewVoteSchema);
export default ReviewVote;
