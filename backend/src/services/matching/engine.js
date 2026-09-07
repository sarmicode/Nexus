/**
 * Matching engine (Phase 05) — rule-based scoring of listings against demands.
 * Score 0–100 with transparent weight breakdown.
 */
const CropListing = require('../../models/crop-listing.model');
const BuyerDemand = require('../../models/buyer-demand.model');

// Weights (sum = 100).
const WEIGHTS = {
  cropMatch: 30,
  quantityCoverage: 20,
  distance: 20,
  priceAlignment: 15,
  freshness: 10,
  grade: 5,
};

// Haversine distance in km.
function haversine(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeQtyToKg(qty) {
  if (!qty) return 0;
  if (qty.unit === 'kg') return qty.value;
  if (qty.unit === 'quintal') return qty.value * 100;
  if (qty.unit === 'tonne') return qty.value * 1000;
  return qty.value;
}

function scoreListingForDemand(listing, demand) {
  const breakdown = {};
  let total = 0;

  // 1. Crop match (must).
  const cropMatch =
    demand.cropsWanted &&
    demand.cropsWanted.some(
      (c) => c.toLowerCase().trim() === listing.crop.toLowerCase().trim()
    );
  if (!cropMatch) return { score: 0, breakdown: { cropMatch: 0 } };
  breakdown.cropMatch = WEIGHTS.cropMatch;
  total += WEIGHTS.cropMatch;

  // 2. Quantity coverage.
  const listingKg = normalizeQtyToKg(listing.quantity);
  const demandKg = normalizeQtyToKg(demand.quantityNeeded);
  if (demandKg > 0) {
    const ratio = Math.min(listingKg / demandKg, 1);
    breakdown.quantityCoverage = Math.round(ratio * WEIGHTS.quantityCoverage);
  } else {
    breakdown.quantityCoverage = WEIGHTS.quantityCoverage;
  }
  total += breakdown.quantityCoverage;

  // 3. Distance.
  const lGeo = listing.location && listing.location.geo;
  const distKm =
    lGeo && lGeo.length === 2
      ? haversine(lGeo[0], lGeo[1], 22.5726, 88.3639) // fallback to Kolkata
      : null;
  if (demand.maxDistanceKm && distKm !== null) {
    const ratio = Math.max(0, 1 - distKm / demand.maxDistanceKm);
    breakdown.distance = Math.round(ratio * WEIGHTS.distance);
  } else if (distKm !== null) {
    // Default: closer is better, max 500 km.
    const ratio = Math.max(0, 1 - distKm / 500);
    breakdown.distance = Math.round(ratio * WEIGHTS.distance);
  } else {
    breakdown.distance = Math.round(0.5 * WEIGHTS.distance);
  }
  total += breakdown.distance;

  // 4. Price alignment.
  if (demand.budgetPerUnit && listing.pricePerUnit) {
    const ratio =
      listing.pricePerUnit <= demand.budgetPerUnit
        ? 1
        : Math.max(0, 1 - (listing.pricePerUnit - demand.budgetPerUnit) / demand.budgetPerUnit);
    breakdown.priceAlignment = Math.round(ratio * WEIGHTS.priceAlignment);
  } else {
    breakdown.priceAlignment = Math.round(0.7 * WEIGHTS.priceAlignment);
  }
  total += breakdown.priceAlignment;

  // 5. Freshness (newer listings score higher).
  const ageDays = (Date.now() - new Date(listing.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  const freshnessRatio = Math.max(0, 1 - ageDays / 30);
  breakdown.freshness = Math.round(freshnessRatio * WEIGHTS.freshness);
  total += breakdown.freshness;

  // 6. Grade bonus.
  const gradeMap = { A: 1, B: 0.6, C: 0.3 };
  breakdown.grade = Math.round((gradeMap[listing.grade] || 0.5) * WEIGHTS.grade);
  total += breakdown.grade;

  return { score: Math.min(100, total), breakdown };
}

async function getMatchesForListing(listingId) {
  const listing = await CropListing.findById(listingId);
  if (!listing || listing.deletedAt) return { items: [], listing: null };

  const demands = await BuyerDemand.find({ active: true }).populate('buyerId', 'name phone');
  const matches = demands
    .map((demand) => {
      const result = scoreListingForDemand(listing, demand);
      return {
        demand: demand.toObject(),
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return { items: matches, listing: listing.toObject() };
}

async function getMatchesForDemand(demandId) {
  const demand = await BuyerDemand.findById(demandId);
  if (!demand) return { items: [], demand: null };

  const filter = { deletedAt: null, status: 'active' };
  if (demand.cropsWanted && demand.cropsWanted.length > 0) {
    filter.crop = { $in: demand.cropsWanted.map((c) => c.toLowerCase().trim()) };
  }

  const listings = await CropListing.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate({ path: 'farmerId', select: 'name location' });

  const matches = listings
    .map((listing) => {
      const result = scoreListingForDemand(listing, demand);
      return {
        listing: listing.toObject(),
        score: result.score,
        breakdown: result.breakdown,
      };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return { items: matches, demand: demand.toObject() };
}

async function getPersonalizedFeed(buyerId) {
  const demands = await BuyerDemand.find({ buyerId, active: true });
  if (demands.length === 0) {
    // No demands — return latest active listings.
    const listings = await CropListing.find({ deletedAt: null, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: 'farmerId', select: 'name location' });
    return { items: listings.map((l) => ({ listing: l.toObject(), score: 0, breakdown: {} })) };
  }

  const allMatches = [];
  for (const demand of demands) {
    const result = await getMatchesForDemand(demand._id);
    allMatches.push(...result.items);
  }

  // Deduplicate by listing id, keep highest score.
  const seen = new Map();
  for (const m of allMatches) {
    const id = String(m.listing._id);
    if (!seen.has(id) || seen.get(id).score < m.score) {
      seen.set(id, m);
    }
  }

  return {
    items: Array.from(seen.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 30),
  };
}

module.exports = {
  scoreListingForDemand,
  getMatchesForListing,
  getMatchesForDemand,
  getPersonalizedFeed,
  WEIGHTS,
};
