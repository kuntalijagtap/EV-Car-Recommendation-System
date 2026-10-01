import mongoose from 'mongoose';

/**
 * ChargingStation Schema
 * Geospatial entity representing EV charging stations.
 * RATIONALE:
 * Uses GeoJSON Point with 2dsphere indexing for $near, $geoWithin, and spatial proximity queries.
 */
const chargingStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    operator: {
      type: String,
      required: [true, 'Operator name is required'], // e.g. Tata Power EZ Charge, Jio-bp pulse, Kazam, Fortum
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
    },
    connectorTypes: [
      {
        type: String,
        enum: ['CCS2', 'Type 2', 'GB/T', 'CHAdeMO', '15A Socket'],
        required: true,
      },
    ],
    powerKw: {
      type: Number,
      required: [true, 'Charging power in kW is required'],
      min: 3,
    },
    totalPorts: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    availablePorts: {
      type: Number,
      required: true,
      min: 0,
      default: 2,
    },
    costPerKwh: {
      type: Number,
      required: true, // In INR, e.g. 18.5
      min: 0,
    },
    openHours: {
      type: String,
      default: '24x7',
    },
    amenities: [{ type: String }], // Cafe, Restroom, Washroom, WiFi, Shopping
  },
  { timestamps: true }
);

// Geospatial index for radius and proximity queries
chargingStationSchema.index({ location: '2dsphere' });
chargingStationSchema.index({ city: 1, connectorTypes: 1 });

export const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);
export default ChargingStation;
