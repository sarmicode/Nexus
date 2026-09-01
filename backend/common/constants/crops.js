/**
 * Shared crop / listing constants (Phase 02 — Farmer Module).
 *
 * - CROPS is the canonical crop list used by the farmer listing form's
 *   typeahead. It is mirrored in frontend/src/data/crops.js — keep both in
 *   sync (noted in docs/PROJECT_STATE.md).
 * - QUANTITY_UNITS, GRADES, PRICE_TYPES and LISTING_STATUSES are enforced by
 *   the listing validator (src/validators/listing.validator.js).
 */
const CROPS = [
  'Wheat',
  'Paddy (Rice)',
  'Maize',
  'Jowar (Sorghum)',
  'Bajra (Pearl Millet)',
  'Ragi (Finger Millet)',
  'Barley',
  'Gram (Chana)',
  'Arhar / Tur (Pigeon Pea)',
  'Moong (Green Gram)',
  'Urad (Black Gram)',
  'Masoor (Red Lentil)',
  'Soybean',
  'Groundnut',
  'Mustard',
  'Sesame',
  'Sunflower',
  'Safflower',
  'Castor',
  'Linseed',
  'Cotton',
  'Jute',
  'Sugarcane',
  'Potato',
  'Onion',
  'Tomato',
  'Brinjal (Eggplant)',
  'Cauliflower',
  'Cabbage',
  'Okra (Bhindi)',
  'Peas',
  'Beans',
  'Cucumber',
  'Bitter Gourd',
  'Bottle Gourd',
  'Pumpkin',
  'Carrot',
  'Radish',
  'Beetroot',
  'Spinach',
  'Coriander',
  'Fenugreek',
  'Ginger',
  'Garlic',
  'Turmeric',
  'Chilli',
  'Capsicum',
  'Banana',
  'Mango',
  'Guava',
  'Papaya',
  'Pomegranate',
  'Grapes',
  'Apple',
  'Orange',
  'Lemon',
  'Coconut',
  'Cashew',
  'Arecanut',
  'Cardamom',
  'Black Pepper',
  'Tea',
  'Coffee',
];

const QUANTITY_UNITS = ['quintal', 'kg', 'tonne'];
const GRADES = ['A', 'B', 'C'];
const PRICE_TYPES = ['fixed', 'negotiable'];
const LISTING_STATUSES = ['draft', 'active', 'sold', 'expired'];

module.exports = { CROPS, QUANTITY_UNITS, GRADES, PRICE_TYPES, LISTING_STATUSES };
