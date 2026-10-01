import mongoose from 'mongoose';

/**
 * EV Schema
 * Core Vehicle document.
 * 
 * DBMS DESIGN DECISIONS & TRADE-OFFS:
 * 1. Reference Brand: ev.brandId -> Brand collection (1:N normalization).
 * 2. Embedded Specs & Hotspots: Performance, battery, dimensions, hotspots360, and image arrays
 *    are embedded because they have a 1:1 or 1-to-few bounded relationship and are always read
 *    together with the EV document, eliminating expensive $lookup operations.
 * 3. Deliberate 3NF Trade-off (Denormalized ratingAggregates):
 *    In strict 3NF relational modeling, averageRating and category averages would NEVER be stored
 *    in the vehicle table; they would be computed on-the-fly via SQL SUM/AVG across the reviews table.
 *    In an e-commerce EV advisor catalog with heavy read traffic (thousands of queries/sec sorting
 *    by rating and filtering by price/range), recomputing aggregations across thousands of review
 *    records per page-load would create severe I/O bottlenecks.
 *    Therefore, we deliberately denormalize `ratingAggregates` into the EV document, maintaining
 *    eventual/immediate consistency via atomic ACID transactions upon review submission.
 */
const evSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'EV Name is required'],
      trim: true,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand reference is required'],
      index: true,
    },
    modelYear: {
      type: Number,
      default: null,
    },
    variant: {
      type: String,
      default: null,
      trim: true,
    },
    market: {
      type: String,
      default: 'India',
      index: true,
    },
    bodyType: {
      type: String,
      enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Crossover', null],
      default: null,
      index: true,
    },
    price: {
      exShowroom: {
        type: Number,
        default: null,
        index: true,
      },
      onRoadEstimate: {
        type: Number,
        default: null,
      },
    },
    battery: {
      capacityKwh: { type: Number, default: null },
      chemistry: { type: String, default: null },
      warrantyYears: { type: Number, default: null },
      warrantyKm: { type: Number, default: null },
    },
    performance: {
      powerBhp: { type: Number, default: null },
      torqueNm: { type: Number, default: null },
      topSpeedKmph: { type: Number, default: null },
      acceleration0to100: { type: Number, default: null }, // seconds
    },
    range: {
      claimedNedc: { type: Number, default: null, index: true }, // km
      claimedWltp: { type: Number, default: null },
      realWorldEstimateCity: { type: Number, default: null },
      realWorldEstimateHighway: { type: Number, default: null },
    },
    charging: {
      acChargingTimeHours: { type: Number, default: null },
      dcFastChargingTimeMinutes: { type: Number, default: null },
      portType: { type: String, default: null },
      maxDcRateKw: { type: Number, default: null },
    },
    dimensions: {
      seatingCapacity: { type: Number, default: null },
      bootSpaceLitres: { type: Number, default: null },
      groundClearanceMm: { type: Number, default: null },
    },
    features: [{ type: String }],
    pros: [{ type: String }],
    cons: [{ type: String }],
    imageUrl: {
      type: String,
      default: null,
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    // Flagship 360° visualizer support (Only 5-6 flagship EVs get full .glb 360 models)
    has360Model: {
      type: Boolean,
      default: false,
      index: true,
    },
    model3dGlbUrl: {
      type: String,
      default: null,
    },
    panoramaInteriorUrl: {
      type: String,
      default: null,
    },
    hotspots360: [
      {
        id: { type: String, required: true },
        viewType: { type: String, enum: ['exterior', 'interior'], default: 'exterior' },
        name: { type: String, required: true },
        category: {
          type: String,
          enum: ['charging_port', 'battery_pack', 'infotainment', 'boot_space', 'motor', 'safety'],
        },
        coordinates: {
          yaw: { type: Number, required: true },
          pitch: { type: Number, required: true },
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        specHighlight: { type: String },
      },
    ],
    // Denormalized ratings (3NF trade-off for blazing fast read queries)
    ratingAggregates: {
      averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
      totalReviews: { type: Number, default: 0 },
      categoryAverages: {
        range: { type: Number, default: 0 },
        comfort: { type: Number, default: 0 },
        chargingExperience: { type: Number, default: 0 },
        buildQuality: { type: Number, default: 0 },
        valueForMoney: { type: Number, default: 0 },
      },
    },
    aiSummary: {
      whatOwnersLike: [{ type: String }],
      whatOwnersDislike: [{ type: String }],
      lastGeneratedAt: { type: Date, default: null },
    },
    viewCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isSampleData: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
evSchema.index({ 'price.exShowroom': 1, 'range.claimedNedc': -1 });
evSchema.index({ bodyType: 1, 'price.exShowroom': 1 });
evSchema.index({ name: 'text', variant: 'text', features: 'text' });

export const EV = mongoose.model('EV', evSchema);
export default EV;
