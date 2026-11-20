import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { EV } from '../models/EV.js';
// Register Brand before populating EV.brandId below; this script runs outside app.js.
import '../models/Brand.js';
import { loadKaggleCsv } from '../utils/csvLoader.js';

dotenv.config();
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../');
const csvPath = process.env.KAGGLE_CSV_PATH || path.join(root, 'data', 'kaggle_evs.csv');
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const canonicalBrand = (value) => {
  const brand = normalize(value);
  if (brand.includes('tata')) return 'tata';
  if (brand.includes('mg')) return 'mg';
  if (brand.includes('mercedes')) return 'mercedesbenz';
  if (brand.includes('volkswagen') || brand === 'vw') return 'volkswagen';
  if (brand.includes('byd')) return 'byd';
  if (brand.includes('mahindra')) return 'mahindra';
  if (brand.includes('leapmotor')) return 'leapmotor';
  return brand.replace(/(india|motors|motor|cars|group)$/, '');
};

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora');
  const [catalog, vehicles] = await Promise.all([loadKaggleCsv(csvPath), EV.find().populate('brandId', 'name')]);
  const catalogByVariant = new Map(catalog.map((ev) => {
    const model = ev.name.slice(ev.brandName.length).trim();
    return [`${canonicalBrand(ev.brandName)}:${normalize(model)}:${normalize(ev.variant)}`, ev];
  }));
  const catalogByModel = new Map();
  for (const ev of catalog) {
    const model = ev.name.slice(ev.brandName.length).trim();
    const key = `${canonicalBrand(ev.brandName)}:${normalize(model)}`;
    const current = catalogByModel.get(key);
    catalogByModel.set(key, current ? null : ev);
  }
  let matched = 0;
  let changed = 0;
  for (const ev of vehicles) {
    const brand = ev.brandId?.name || '';
    const brandKey = canonicalBrand(brand);
    const fullName = normalize(ev.name);
    const model = fullName.startsWith(brandKey) ? fullName.slice(brandKey.length) : fullName;
    const variant = normalize(ev.variant);
    const source = catalogByVariant.get(`${brandKey}:${model}:${variant}`)
      || catalogByModel.get(`${brandKey}:${model}`);
    if (!source) continue;
    matched += 1;
    const specs = [
      ['price.exShowroom', source.price.exShowroom],
      ['price.onRoadEstimate', source.price.onRoadEstimate],
      ['battery.chemistry', source.battery.chemistry],
      ['battery.warrantyYears', source.battery.warrantyYears],
      ['battery.warrantyKm', source.battery.warrantyKm],
      ['battery.warrantyText', source.battery.warrantyText],
      ['charging.dcFastChargingTimeMinutes', source.charging.dcFastChargingTimeMinutes],
      ['charging.maxDcRateKw', source.charging.maxDcRateKw],
      ['charging.portType', source.charging.portType],
      ['performance.torqueNm', source.performance.torqueNm],
      ['performance.topSpeedKmph', source.performance.topSpeedKmph],
      ['performance.acceleration0to100', source.performance.acceleration0to100],
      ['range.claimedWltp', source.range.claimedWltp],
      ['dimensions.seatingCapacity', source.dimensions.seatingCapacity],
      ['dimensions.bootSpaceLitres', source.dimensions.bootSpaceLitres],
      ['dataSourceUrl', source.dataSourceUrl],
    ];
    const $set = {};
    for (const [field, value] of specs) {
      if (value == null || value === '') continue;
      const current = field.split('.').reduce((value, key) => value?.[key], ev);
      if (current == null || current === '') $set[field] = value;
    }
    if (Object.keys($set).length) {
      await EV.updateOne({ _id: ev._id }, { $set });
      changed += 1;
    }
  }
  console.log(`Matched ${matched} EV records; enriched ${changed} records with available supplementary specifications.`);
} catch (error) {
  console.error(`EV specification enrichment failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
