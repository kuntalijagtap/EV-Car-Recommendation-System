import { loadRangeFactors } from '../config/rangeFactors.js';

const DEFAULTS = {
  trafficCondition: 'Moderate',
  terrainType: 'Flat',
  drivingStyle: 'Normal',
};

function getMultiplier(factors, factor, level) {
  const factorValue = factors[factor]?.[level.toLowerCase()];
  if (factorValue === undefined) {
    throw new Error(`Unsupported ${factor} level "${level}".`);
  }
  return factorValue.multiplier;
}

function adjustRange(range, multiplier) {
  return typeof range === 'number' ? Math.round(range * multiplier) : null;
}

export async function calculateRangeComfortScore(ev, selections = {}) {
  const trafficCondition = selections.trafficCondition || DEFAULTS.trafficCondition;
  const terrainType = selections.terrainType || DEFAULTS.terrainType;
  const drivingStyle = selections.drivingStyle || DEFAULTS.drivingStyle;
  const factors = await loadRangeFactors();

  const trafficRaw = getMultiplier(factors, 'traffic_condition', trafficCondition);
  const trafficMultiplier = trafficCondition.toLowerCase() === 'free' ? Math.min(trafficRaw, 1.10) : trafficRaw;
  const terrainMultiplier = getMultiplier(factors, 'terrain_type', terrainType);
  const drivingStyleMultiplier = getMultiplier(factors, 'driving_style', drivingStyle);
  const combinedMultiplier = Math.max(0.6, Math.min(1.15, trafficMultiplier * terrainMultiplier * drivingStyleMultiplier));
  const cityRangeKm = ev.range?.realWorldEstimateCity ?? null;
  const highwayRangeKm = ev.range?.realWorldEstimateHighway ?? null;

  return {
    trafficCondition,
    terrainType,
    drivingStyle,
    trafficMultiplier,
    terrainMultiplier,
    drivingStyleMultiplier,
    combinedMultiplier,
    adjustedCityRangeKm: adjustRange(cityRangeKm, combinedMultiplier),
    adjustedHighwayRangeKm: adjustRange(highwayRangeKm, combinedMultiplier),
  };
}

/* ======================================================================
   Chat advisor helpers (added): daily-distance based Range Comfort Score
   ====================================================================== */

/** Real-world range based only on real-world fields recorded in the database. */
export function realWorldRange(ev) {
  const r = ev.range || {};
  const city = r.realWorldEstimateCity, hwy = r.realWorldEstimateHighway;
  if (city && hwy) return Math.round((city + hwy) / 2);
  if (city || hwy) return city || hwy;
  return null;
}

/** One multiplier for the user's traffic/terrain/driving style (from data/range_factors.csv). */
export async function conditionMultiplier(conditions = {}) {
  const s = await calculateRangeComfortScore({}, conditions);
  return { multiplier: s.combinedMultiplier, traffic: s.trafficCondition, terrain: s.terrainType, style: s.drivingStyle };
}

/**
 * Range Comfort Score 0-100:
 *   usable = realWorldRange x conditionMultiplier x 0.80 (20% battery reserve) x 0.92 (AC on)
 *   daysPerCharge = usable / dailyKm ; score = min(100, daysPerCharge x 25)
 */
export function rangeComfort(ev, dailyKm, multiplier = 1, ac = true) {
  if (!dailyKm || dailyKm <= 0) return null;
  const baseRange = realWorldRange(ev);
  if (!baseRange) return null;
  const real = Math.round(baseRange * multiplier);
  const usable = Math.round(real * 0.8 * (ac ? 0.92 : 1));
  const days = usable / dailyKm;
  const score = Math.max(0, Math.min(100, Math.round(days * 25)));
  return {
    score,
    label: score >= 80 ? 'Very comfortable' : score >= 55 ? 'Comfortable' : score >= 35 ? 'Manageable' : 'Tight',
    adjustedRangeKm: real,
    usableRangeKm: usable,
    chargeEveryDays: Math.round(days * 10) / 10,
    reason: `About ${usable} km usable per charge (20% reserve${ac ? ', AC on' : ''}) against ${dailyKm} km a day: a charge roughly every ${days.toFixed(1)} days.`,
  };
}

export function runningCost(ev, dailyKm, { electricityRate = 8, petrolPrice = 105, petrolKmpl = 15 } = {}) {
  const cap = ev.battery?.capacityKwh;
  const real = realWorldRange(ev);
  if (!cap || !real) return { unavailable: true, message: 'Running cost is unavailable because battery or real-world range data is missing.' };
  const evMonthly = Math.round((cap / real) * dailyKm * 30 * electricityRate);
  const petrolMonthly = Math.round((dailyKm * 30 / petrolKmpl) * petrolPrice);
  return { evMonthly, petrolMonthly, monthlySaving: petrolMonthly - evMonthly, fiveYearSaving: (petrolMonthly - evMonthly) * 60, assumptions: { electricityRate, petrolPrice, petrolKmpl } };
}

/** Compact card sent to the chat UI and to the LLM as tool output. */
export function toCard(ev, dailyKm, multiplier = 1) {
  return {
    _id: String(ev._id), name: ev.name, variant: ev.variant, bodyType: ev.bodyType,
    brand: ev.brandId?.name || null, imageUrl: ev.imageUrl || ev.images?.[0]?.url || null,
    isSampleData: Boolean(ev.isSampleData),
    imageProvidedByDataset: Boolean(ev.imageProvidedByDataset),
    priceVerifiedAt: ev.priceVerifiedAt || null, specsVerifiedAt: ev.specsVerifiedAt || null,
    dataSourceUrl: ev.dataSourceUrl || null,
    priceExShowroom: ev.price?.exShowroom, claimedRangeKm: ev.range?.claimedNedc,
    realWorldRangeKm: realWorldRange(ev) ? Math.round(realWorldRange(ev) * multiplier) : null, batteryKwh: ev.battery?.capacityKwh,
    seats: ev.dimensions?.seatingCapacity, bootLitres: ev.dimensions?.bootSpaceLitres,
    rating: ev.ratingAggregates?.averageRating,
    has360: (ev.view360Frames?.length || 0) > 1,
    comfort: dailyKm ? rangeComfort(ev, dailyKm, multiplier) : null,
  };
}
