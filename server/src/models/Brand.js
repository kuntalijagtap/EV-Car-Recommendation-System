import mongoose from 'mongoose';

/**
 * Brand Schema
 * Normalized 1:N reference target for EV models.
 * Decision Rationale (Reference): Avoids redundant storage of brand metadata across 
 * dozens of EV variants and prevents update anomalies.
 */
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    originCountry: {
      type: String,
      required: [true, 'Origin country is required'],
      default: 'India',
    },
    logoUrl: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    supportContact: {
      type: String,
    },
    activeEvCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
