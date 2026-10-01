import mongoose from 'mongoose';

/**
 * Wishlist Schema
 * Junction collection resolving Many-to-Many between User and EV.
 * RATIONALE:
 * Decouples user saved items from vehicle catalog writes. Allows bidirectional queries:
 * 1. User wishlist: find({ userId })
 * 2. Trending analytics: aggregation pipeline grouping by evId to count total wishlists.
 */
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    evId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EV',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

// Strict unique constraint: User cannot wishlist the same car twice
wishlistSchema.index({ userId: 1, evId: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
