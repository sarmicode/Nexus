/**
 * Logistics service (Phase 07) — distance, cost estimates, route suggestions.
 */
const ApiError = require('../../common/utils/ApiError');

function haversine(lat1, lon1, lat2, lon2) {
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

// Rate card (₹ per tonne per km).
const RATE_PER_TONNE_KM = 3.5;
const MIN_COST = 500;
const SPEED_KMH = 40;

function estimateLogistics(from, to, qtyTonnes) {
  if (!from || !to || from.length < 2 || to.length < 2) {
    throw ApiError.badRequest('from and to must be [lat, lng] arrays');
  }
  const distanceKm = Math.round(haversine(from[0], from[1], to[0], to[1]));
  const tonnes = qtyTonnes || 1;
  const baseCost = Math.max(MIN_COST, Math.round(distanceKm * tonnes * RATE_PER_TONNE_KM));
  const costBand = {
    low: Math.round(baseCost * 0.85),
    high: Math.round(baseCost * 1.15),
  };
  const etaHours = Math.round(distanceKm / SPEED_KMH);

  return {
    distanceKm,
    etaHours,
    etaText: etaHours < 24 ? `${etaHours}h` : `${Math.round(etaHours / 24)}d ${etaHours % 24}h`,
    cost: baseCost,
    costBand,
    qtyTonnes: tonnes,
  };
}

// TSP-lite nearest-neighbor multi-stop route.
function optimizeRoute(stops) {
  if (!stops || stops.length < 2) {
    throw ApiError.badRequest('At least 2 stops required');
  }

  const remaining = stops.slice(1);
  const route = [stops[0]];
  let totalDistance = 0;

  while (remaining.length > 0) {
    const current = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(current[0], current[1], remaining[i][0], remaining[i][1]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    totalDistance += nearestDist;
    route.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return {
    route,
    totalDistanceKm: Math.round(totalDistance),
    etaHours: Math.round(totalDistance / SPEED_KMH),
  };
}

module.exports = {
  estimateLogistics,
  optimizeRoute,
};
