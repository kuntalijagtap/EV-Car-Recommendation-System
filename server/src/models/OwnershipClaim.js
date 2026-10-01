import mongoose from 'mongoose';

/**
 * OwnershipClaim Schema
 * Administrative verification entity for authenticating EV owners.
 * RATIONALE:
 * Separate reference entity keeping audit logs and verification states out of
 * the core User and EV models.
 */
const ownershipClaimSchema = new mongoose.Schema(
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
    registrationNumberMasked: {
      type: String,
      required: [true, 'Masked registration number is required (e.g. MH12**9988)'],
      trim: true,
    },
    proofDocumentUrl: {
      type: String,
      required: [true, 'Proof document URL (RC or Insurance) is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

ownershipClaimSchema.index({ userId: 1, evId: 1 });

export const OwnershipClaim = mongoose.model('OwnershipClaim', ownershipClaimSchema);
export default OwnershipClaim;
