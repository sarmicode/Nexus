/**
 * Seed mandi price data (Phase 04) — realistic WB + all-India prices.
 * Run: cd backend && node src/scripts/seedPrices.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const PriceRecord = require('../models/price-record.model');

const MANDIS = [
  { mandiName: 'Kolkata (Sealdah)', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { mandiName: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
  { mandiName: 'Kharagpur', district: 'Paschim Medinipur', state: 'West Bengal', lat: 22.3461, lng: 87.2320 },
  { mandiName: 'Bardhaman', district: 'Purba Bardhaman', state: 'West Bengal', lat: 23.2324, lng: 87.8615 },
  { mandiName: 'Malda', district: 'Malda', state: 'West Bengal', lat: 25.0087, lng: 88.1381 },
  { mandiName: 'Krishnanagar', district: 'Nadia', state: 'West Bengal', lat: 23.4000, lng: 88.5000 },
  { mandiName: 'Bankura', district: 'Bankura', state: 'West Bengal', lat: 23.2324, lng: 87.0680 },
  { mandiName: 'Azadpur (Delhi)', district: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { mandiName: 'Vashi (Mumbai)', district: 'Thane', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { mandiName: 'Koyambedu (Chennai)', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0697, lng: 80.1983 },
  { mandiName: 'Bowenpally (Hyderabad)', district: 'Hyderabad', state: 'Telangana', lat: 17.4932, lng: 78.4980 },
  { mandiName: 'Yeshwanthpur (Bengaluru)', district: 'Bengaluru', state: 'Karnataka', lat: 13.0169, lng: 77.5465 },
];

const CROPS = [
  { crop: 'tomato', basePrice: 1800, variance: 600 },
  { crop: 'potato', basePrice: 1200, variance: 300 },
  { crop: 'onion', basePrice: 2200, variance: 800 },
  { crop: 'rice (paddy)', basePrice: 2100, variance: 200 },
  { crop: 'wheat', basePrice: 2300, variance: 250 },
  { crop: 'cauliflower', basePrice: 1500, variance: 500 },
  { crop: 'cabbage', basePrice: 1100, variance: 350 },
  { crop: 'brinjal', basePrice: 1600, variance: 450 },
  { crop: 'green chilli', basePrice: 3500, variance: 1200 },
  { crop: 'mustard', basePrice: 5200, variance: 400 },
  { crop: 'jute', basePrice: 4800, variance: 350 },
  { crop: 'green peas', basePrice: 3200, variance: 900 },
];

const DAYS = 90;

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[seed-prices] Connected to MongoDB');

  // Clear old seed data.
  await PriceRecord.deleteMany({ source: 'seed' });
  console.log('[seed-prices] Cleared old seed data');

  const records = [];
  const now = new Date();

  for (let d = 0; d < DAYS; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(6, 0, 0, 0);

    for (const mandi of MANDIS) {
      // Each mandi carries a subset of crops (4-8).
      const mandiCrops = CROPS.filter(() => Math.random() > 0.35);
      for (const c of mandiCrops) {
        // Seasonal drift + daily noise.
        const seasonalFactor = 1 + 0.15 * Math.sin((d / DAYS) * 2 * Math.PI);
        const noise = (Math.random() - 0.5) * c.variance;
        const modal = Math.max(100, Math.round(c.basePrice * seasonalFactor + noise));
        const min = Math.round(modal * (0.75 + Math.random() * 0.1));
        const max = Math.round(modal * (1.15 + Math.random() * 0.15));

        records.push({
          source: 'seed',
          market: { ...mandi },
          crop: c.crop,
          variety: undefined,
          grade: undefined,
          minPrice: min,
          maxPrice: max,
          modalPrice: modal,
          arrivals: { date, qtyTonnes: randomBetween(2, 120) },
          recordedOn: date,
        });
      }
    }
  }

  // Bulk insert in chunks.
  const CHUNK = 500;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    await PriceRecord.insertMany(chunk, { ordered: false }).catch(() => {});
    process.stdout.write('.');
  }

  console.log(`\n[seed-prices] Inserted ${records.length} price records`);
  await mongoose.disconnect();
  console.log('[seed-prices] Done');
}

seed().catch((err) => {
  console.error('[seed-prices] Error:', err);
  process.exit(1);
});
