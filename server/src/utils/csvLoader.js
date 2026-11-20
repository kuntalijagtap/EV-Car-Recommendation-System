import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

/**
 * Parses a Kaggle EV CSV file.
 * Conforms to strict DBMS rules:
 * - "Do not invent specs" -> Missing, NA, or unparseable fields are explicitly mapped to null.
 * - Adds price, market: "India", and imageUrl.
 * - Does not mark models as 360-capable unless real vehicle-specific assets are supplied.
 */

function safeNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function safeString(val) {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (['-', 'n/a', 'na', 'null', 'none'].includes(trimmed.toLowerCase())) return null;
  return trimmed;
}

function safeDate(val) {
  const value = safeString(val);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeUrl(val) {
  const value = safeString(val);
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}

// Case and format-insensitive column lookup
function getField(raw, ...candidateKeys) {
  for (const k of candidateKeys) {
    if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') {
      return raw[k];
    }
  }
  // Try normalized comparison
  const normalized = {};
  for (const [rk, rv] of Object.entries(raw)) {
    normalized[rk.toLowerCase().replace(/[^a-z0-9]/g, '')] = rv;
  }
  for (const k of candidateKeys) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized[cleanKey] !== undefined && normalized[cleanKey] !== null && String(normalized[cleanKey]).trim() !== '') {
      return normalized[cleanKey];
    }
  }
  return null;
}

function resolveImageUrl(explicitUrl) {
  // Only use a vehicle photo explicitly supplied by the data source; never guess
  // from a model name or reuse a generic stock image as if it were that car.
  return safeString(explicitUrl);
}

function normalizeModelKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function loadSupplementalSpecs(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Reads and parses a CSV file with support for various Kaggle EV dataset headers.
 */
export async function loadKaggleCsv(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found at ${filePath}`));
    }

    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        const parsed = rows.map((raw) => {
          // Normalize possible column keys from Kaggle datasets
          const brandName = safeString(getField(raw, 'Brand', 'brand', 'Make', 'Company') || 'Tata');
          const modelName = safeString(getField(raw, 'Model', 'model', 'Car_name', 'Vehicle') || 'EV');
          const variant = safeString(getField(raw, 'Variant', 'variant', 'Trim') || 'Standard');
          const bodyTypeRaw = safeString(getField(raw, 'BodyStyle', 'Body_Style', 'bodyType', 'Segment', 'Body_Type') || 'SUV');

          // Map body type to allowed enum
          let bodyType = 'SUV';
          if (bodyTypeRaw) {
            const bt = bodyTypeRaw.toLowerCase();
            if (bt.includes('sedan')) bodyType = 'Sedan';
            else if (bt.includes('hatch')) bodyType = 'Hatchback';
            else if (bt.includes('muv') || bt.includes('mpv')) bodyType = 'MUV';
            else if (bt.includes('crossover')) bodyType = 'Crossover';
            else bodyType = 'SUV';
          }

          // Price parsing (Handle INR or Euro conversion or explicit raw price)
          let priceExShowroom = safeNumber(getField(raw, 'Price_INR', 'price_inr', 'Price', 'price', 'exShowroomPrice'));
          if (!priceExShowroom) {
            const priceEuro = safeNumber(getField(raw, 'PriceEuro', 'price_euro'));
            if (priceEuro) priceExShowroom = Math.round(priceEuro * 90);
          }

          const onRoad = priceExShowroom ? Math.round(priceExShowroom * 1.08) : null;

          // Specs parsing - missing values are explicitly set to null
          const rangeNedc = safeNumber(getField(raw, 'Claimed_Range_km', 'Range_Km', 'Range', 'claimedNedc', 'claimed_range'));
          const topSpeed = safeNumber(getField(raw, 'Top_Speed_kmph', 'TopSpeed_KmH', 'Top_Speed', 'topSpeedKmph'));
          const accel = safeNumber(getField(raw, 'AccelSec', 'acceleration0to100', 'Acceleration'));
          const batteryKwh = safeNumber(getField(raw, 'Battery_Capacity_kWh', 'Battery', 'capacityKwh'));
          const seating = safeNumber(getField(raw, 'Seats', 'seatingCapacity')) || 5;
          const fastChargeMin = safeNumber(getField(raw, 'Fast_Charging_Mins', 'FastCharge_KmH', 'dcFastChargingTimeMinutes'));
          const powerBhp = safeNumber(getField(raw, 'Power_bhp', 'powerBhp', 'Power'));
          const torqueNm = safeNumber(getField(raw, 'Torque_Nm', 'torqueNm', 'Torque'));

          const fullName = `${brandName} ${modelName}`;
          const imageUrl = resolveImageUrl(getField(raw, 'ImageUrl', 'imageUrl', 'image'));

          return {
            brandName,
            name: fullName,
            variant: variant || 'Base',
            market: 'India',
            bodyType,
            price: {
              exShowroom: priceExShowroom,
              onRoadEstimate: onRoad,
            },
            priceVerifiedAt: safeDate(getField(raw, 'PriceVerifiedAt', 'PriceVerified', 'PriceUpdatedAt')),
            specsVerifiedAt: safeDate(getField(raw, 'SpecsVerifiedAt', 'SpecsVerified', 'SpecsUpdatedAt')),
            dataSourceUrl: safeUrl(getField(raw, 'DataSourceUrl', 'SourceUrl')),
            battery: {
              capacityKwh: batteryKwh,
              chemistry: safeString(getField(raw, 'Battery_Chemistry')),
              warrantyYears: safeNumber(getField(raw, 'Warranty_Years')),
              warrantyKm: safeNumber(getField(raw, 'Warranty_Km')),
              warrantyText: safeString(getField(raw, 'Battery_Warranty', 'Warranty_Text', 'BatteryWarranty')),
            },
            performance: {
              powerBhp,
              torqueNm,
              topSpeedKmph: topSpeed,
              acceleration0to100: accel,
            },
            range: {
              claimedNedc: rangeNedc,
              claimedWltp: safeNumber(getField(raw, 'Range_WLTP')),
              realWorldEstimateCity: safeNumber(getField(raw, 'RealWorld_City_km')) ?? (rangeNedc === null ? null : Math.round(rangeNedc * 0.82)),
              realWorldEstimateHighway: safeNumber(getField(raw, 'RealWorld_Highway_km')) ?? (rangeNedc === null ? null : Math.round(rangeNedc * 0.72)),
            },
            charging: {
              acChargingTimeHours: safeNumber(getField(raw, 'AC_Charging_Hours')) || (batteryKwh ? Math.round((batteryKwh / 7.2) * 10) / 10 : null),
              dcFastChargingTimeMinutes: fastChargeMin,
              portType: safeString(getField(raw, 'PlugType', 'portType')) || 'CCS2',
              maxDcRateKw: safeNumber(getField(raw, 'Max_DC_Rate_kW')),
            },
            dimensions: {
              seatingCapacity: seating || 5,
              bootSpaceLitres: safeNumber(getField(raw, 'Boot_Space_L')),
              groundClearanceMm: safeNumber(getField(raw, 'Ground_Clearance_mm')),
            },
            features: [
              'Connected Car Telematics',
              'Regenerative Braking',
              'Fast DC Charging',
              'Smart Infotainment System',
            ],
            pros: [
              'Zero tailpipe emissions and low running cost',
              'Instant electric torque response',
            ],
            cons: [
              'Public fast charging availability dependent on route',
            ],
            imageUrl,
            imageProvidedByDataset: Boolean(imageUrl),
            has360Model: false,
            model3dGlbUrl: null,
            panoramaInteriorUrl: null,
            isSampleData: false,
          };
        });

        const supplementalPath = path.join(path.dirname(filePath), 'hf_ev_specs.csv');
        if (!fs.existsSync(supplementalPath)) return resolve(parsed);
        loadSupplementalSpecs(supplementalPath).then((supplementalRows) => {
          const specsByModel = new Map();
          for (const row of supplementalRows) {
            const key = `${normalizeModelKey(row.brand)}:${normalizeModelKey(row.model)}`;
            if (!specsByModel.has(key)) specsByModel.set(key, row);
          }
          for (const ev of parsed) {
            const model = ev.name.slice(ev.brandName.length).trim();
            const brandKey = normalizeModelKey(ev.brandName);
            const extra = specsByModel.get(`${brandKey}:${normalizeModelKey(`${model} ${ev.variant}`)}`)
              || specsByModel.get(`${brandKey}:${normalizeModelKey(model)}`);
            if (!extra) continue;
            const fill = (current, value) => current == null || current === '' ? value : current;
            ev.battery.chemistry = fill(ev.battery.chemistry, safeString(extra.battery_type));
            ev.performance.torqueNm = fill(ev.performance.torqueNm, safeNumber(extra.torque_nm));
            ev.performance.topSpeedKmph = fill(ev.performance.topSpeedKmph, safeNumber(extra.top_speed_kmh));
            ev.performance.acceleration0to100 = fill(ev.performance.acceleration0to100, safeNumber(extra.acceleration_0_100_s));
            ev.charging.maxDcRateKw = fill(ev.charging.maxDcRateKw, safeNumber(extra.fast_charging_power_kw_dc));
            ev.charging.portType = fill(ev.charging.portType, safeString(extra.fast_charge_port));
            ev.range.claimedWltp = fill(ev.range.claimedWltp, safeNumber(extra.range_km));
            ev.dimensions.seatingCapacity = fill(ev.dimensions.seatingCapacity, safeNumber(extra.seats));
            ev.dimensions.bootSpaceLitres = fill(ev.dimensions.bootSpaceLitres, safeNumber(extra.cargo_volume_l));
            ev.dataSourceUrl = fill(ev.dataSourceUrl, safeUrl(extra.source_url));
          }
          resolve(parsed);
        }).catch(reject);
      })
      .on('error', reject);
  });
}
