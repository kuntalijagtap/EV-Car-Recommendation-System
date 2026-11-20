import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSV_PATH = path.resolve(__dirname, '../../../data/range_factors.csv');
let factorsPromise;

export function loadRangeFactors(filePath = DEFAULT_CSV_PATH) {
  if (!factorsPromise) {
    factorsPromise = new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        reject(new Error(`Range factor CSV not found at ${filePath}`));
        return;
      }

      const factors = {};
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', ({ factor, level, multiplier, source }) => {
          if (!factor || !level || !Number.isFinite(Number(multiplier))) return;
          factors[factor] ||= {};
          factors[factor][level.trim().toLowerCase()] = { multiplier: Number(multiplier), source: source?.trim() || null };
        })
        .on('end', () => resolve(factors))
        .on('error', reject);
    });
  }
  return factorsPromise;
}