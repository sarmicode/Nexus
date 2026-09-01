/**
 * Crop + listing constants for the farmer listing form (Phase 02).
 *
 * CROPS is the typeahead list — it mirrors backend/common/constants/crops.js;
 * keep both in sync (noted in docs/PROJECT_STATE.md). QUANTITY_UNITS, GRADES
 * and PRICE_TYPES match the backend validator enums.
 */
export const CROPS = [
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

export const QUANTITY_UNITS = [
  ['quintal', 'Quintal'],
  ['kg', 'Kilogram (kg)'],
  ['tonne', 'Tonne'],
];

export const GRADES = [
  ['A', 'Grade A'],
  ['B', 'Grade B'],
  ['C', 'Grade C'],
];

export const PRICE_TYPES = [
  ['fixed', 'Fixed price'],
  ['negotiable', 'Negotiable'],
];
