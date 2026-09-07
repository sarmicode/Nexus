/**
 * Mandi price service (Phase 04) — price queries, caching, trends.
 * Uses an in-memory cache as a Redis stand-in when Redis is unavailable.
 */
const PriceRecord = require('../../models/price-record.model');
const PriceAlert = require('../../models/price-alert.model');
const ApiError = require('../../../common/utils/ApiError');

// ── Simple in-memory cache (Redis swap-in when available) ─────────────
const cache = new Map();
const CACHE_TTL = {
  latest: 6 * 60 * 60 * 1000, // 6 hours
  trends: 24 * 60 * 60 * 1000, // 24 hours
  short: 15 * 60 * 1000, // 15 minutes
};

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key, value, ttl) {
  cache.set(key, { value, ts: Date.now(), ttl });
}

// ── Latest prices ─────────────────────────────────────────────────────
async function getLatestPrices(query) {
  const { crop, state, district } = query;
  if (!crop) throw ApiError.badRequest('crop query parameter is required');

  const cacheKey = `price:latest:${crop}:${state || '*'}:${district || '*'}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const match = { crop: crop.toLowerCase() };
  if (state) match['market.state'] = state;
  if (district) match['market.district'] = { $regex: district, $options: 'i' };

  // Latest per mandi.
  const latestPerMandi = await PriceRecord.aggregate([
    { $match: match },
    { $sort: { recordedOn: -1 } },
    {
      $group: {
        _id: { mandiName: '$market.mandiName', district: '$market.district', state: '$market.state' },
        minPrice: { $first: '$minPrice' },
        maxPrice: { $first: '$maxPrice' },
        modalPrice: { $first: '$modalPrice' },
        variety: { $first: '$variety' },
        grade: { $first: '$grade' },
        recordedOn: { $first: '$recordedOn' },
        source: { $first: '$source' },
        market: { $first: '$market' },
      },
    },
    { $sort: { '_id.state': 1, '_id.district': 1, '_id.mandiName': 1 } },
  ]);

  // District average.
  const districtAgg = await PriceRecord.aggregate([
    { $match: match },
    { $sort: { recordedOn: -1 } },
    {
      $group: {
        _id: { district: '$market.district', state: '$market.state' },
        avgModal: { $avg: '$modalPrice' },
      },
    },
  ]);

  // 7-day change (compare latest vs 7 days ago).
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const prevPrices = await PriceRecord.aggregate([
    { $match: { ...match, recordedOn: { $lte: weekAgo } } },
    { $sort: { recordedOn: -1 } },
    { $group: { _id: '$market.district', modalPrice: { $first: '$modalPrice' } } },
  ]);
  const prevMap = new Map(prevPrices.map((p) => [p._id, p.modalPrice]));

  const items = latestPerMandi.map((item) => {
    const prev = prevMap.get(item._id.district);
    const changePercent = prev ? ((item.modalPrice - prev) / prev) * 100 : null;
    return {
      mandiName: item._id.mandiName,
      district: item._id.district,
      state: item._id.state,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice,
      modalPrice: item.modalPrice,
      variety: item.variety,
      grade: item.grade,
      recordedOn: item.recordedOn,
      source: item.source,
      market: item.market,
      change7d: changePercent !== null ? Math.round(changePercent * 100) / 100 : null,
    };
  });

  const districtAvgs = districtAgg.map((d) => ({
    district: d._id.district,
    state: d._id.state,
    avgModalPrice: Math.round(d.avgModal * 100) / 100,
  }));

  const result = {
    items,
    districtAverages: districtAvgs,
    staleSince: null,
    fetchedAt: new Date(),
  };

  cacheSet(cacheKey, result, CACHE_TTL.latest);
  return result;
}

// ── Trends (7/30/90 day series) ────────────────────────────────────────
async function getTrends(crop, query) {
  const { state, district, range = '30' } = query;
  const days = parseInt(range, 10) || 30;
  const cacheKey = `price:trends:${crop}:${state || '*'}:${district || '*'}:${days}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const match = { crop: crop.toLowerCase(), recordedOn: { $gte: since } };
  if (state) match['market.state'] = state;
  if (district) match['market.district'] = { $regex: district, $options: 'i' };

  const series = await PriceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$recordedOn' } },
        },
        avgModal: { $avg: '$modalPrice' },
        avgMin: { $avg: '$minPrice' },
        avgMax: { $avg: '$maxPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  const result = {
    crop,
    range: days,
    series: series.map((s) => ({
      date: s._id.date,
      avgModal: Math.round(s.avgModal * 100) / 100,
      avgMin: Math.round(s.avgMin * 100) / 100,
      avgMax: Math.round(s.avgMax * 100) / 100,
      count: s.count,
    })),
  };

  cacheSet(cacheKey, result, CACHE_TTL.trends);
  return result;
}

// ── Compare (multi-crop snapshot for a district) ──────────────────────
async function compareCrops(query) {
  const { crops, district } = query;
  if (!crops) throw ApiError.badRequest('crops query parameter is required');
  const cropList = crops.split(',').map((c) => c.trim().toLowerCase());

  const match = {
    crop: { $in: cropList },
    recordedOn: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  };
  if (district) match['market.district'] = { $regex: district, $options: 'i' };

  const latest = await PriceRecord.aggregate([
    { $match: match },
    { $sort: { recordedOn: -1 } },
    {
      $group: {
        _id: { crop: '$crop' },
        modalPrice: { $avg: '$modalPrice' },
        minPrice: { $avg: '$minPrice' },
        maxPrice: { $avg: '$maxPrice' },
        recordedOn: { $max: '$recordedOn' },
      },
    },
    { $sort: { '_id.crop': 1 } },
  ]);

  return {
    district: district || 'All',
    items: latest.map((l) => ({
      crop: l._id.crop,
      modalPrice: Math.round(l.modalPrice * 100) / 100,
      minPrice: Math.round(l.minPrice * 100) / 100,
      maxPrice: Math.round(l.maxPrice * 100) / 100,
      recordedOn: l.recordedOn,
    })),
  };
}

// ── Mandis directory ──────────────────────────────────────────────────
async function getMandis(query) {
  const { state, district, crop } = query;
  const match = {};
  if (state) match['market.state'] = state;
  if (district) match['market.district'] = { $regex: district, $options: 'i' };
  if (crop) match.crop = crop.toLowerCase();

  const mandis = await PriceRecord.aggregate([
    ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
    { $sort: { recordedOn: -1 } },
    {
      $group: {
        _id: {
          mandiName: '$market.mandiName',
          district: '$market.district',
          state: '$market.state',
        },
        latestModal: { $first: '$modalPrice' },
        crop: { $first: '$crop' },
        recordedOn: { $first: '$recordedOn' },
        lat: { $first: '$market.lat' },
        lng: { $first: '$market.lng' },
      },
    },
    { $sort: { '_id.state': 1, '_id.district': 1 } },
    { $limit: 200 },
  ]);

  return {
    items: mandis.map((m) => ({
      mandiName: m._id.mandiName,
      district: m._id.district,
      state: m._id.state,
      latestModalPrice: m.latestModal,
      crop: m.crop,
      recordedOn: m.recordedOn,
      lat: m.lat,
      lng: m.lng,
    })),
  };
}

// ── Mandis geo (for maps) ─────────────────────────────────────────────
async function getMandisGeo() {
  const mandis = await PriceRecord.aggregate([
    { $sort: { recordedOn: -1 } },
    {
      $group: {
        _id: {
          mandiName: '$market.mandiName',
          district: '$market.district',
          state: '$market.state',
        },
        latestModal: { $first: '$modalPrice' },
        crop: { $first: '$crop' },
        lat: { $first: '$market.lat' },
        lng: { $first: '$market.lng' },
        recordedOn: { $first: '$recordedOn' },
      },
    },
    { $match: { lat: { $ne: null }, lng: { $ne: null } } },
  ]);

  return {
    items: mandis.map((m) => ({
      mandiName: m._id.mandiName,
      district: m._id.district,
      state: m._id.state,
      latestModalPrice: m.latestModal,
      crop: m.crop,
      lat: m.lat,
      lng: m.lng,
      recordedOn: m.recordedOn,
    })),
  };
}

// ── Price Alerts ──────────────────────────────────────────────────────
async function createPriceAlert(user, data) {
  const alert = await PriceAlert.create({
    userId: user._id,
    crop: data.crop.toLowerCase(),
    district: data.district,
    belowPrice: data.belowPrice,
    abovePrice: data.abovePrice,
    active: true,
  });
  return alert.toObject();
}

async function getPriceAlerts(user) {
  const alerts = await PriceAlert.find({ userId: user._id }).sort({ createdAt: -1 });
  return { items: alerts.map((a) => a.toObject()) };
}

async function deletePriceAlert(user, alertId) {
  const alert = await PriceAlert.findOneAndDelete({ _id: alertId, userId: user._id });
  if (!alert) throw ApiError.notFound('Price alert not found');
  return { message: 'Price alert deleted' };
}

// ── Ingestion (seed or AGMARKNET) ────────────────────────────────────
async function upsertPriceRecord(data) {
  return PriceRecord.findOneAndUpdate(
    {
      'market.mandiName': data.market.mandiName,
      crop: data.crop,
      recordedOn: data.recordedOn,
    },
    { $set: data },
    { upsert: true, new: true }
  );
}

async function resyncPrices(dateRange) {
  // In a real integration this would fetch from AGMARKNET/eNAM APIs.
  // For now, it's a no-op that returns a status. Ingest service handles actual sync.
  return {
    message: 'Resync triggered',
    range: dateRange,
    note: 'Real AGMARKNET integration requires DATA_GOV_IN_API_KEY env var',
  };
}

// ── Price heatmap (for analytics, Phase 07) ──────────────────────────
async function getPriceHeatmap(crop) {
  const match = { recordedOn: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  if (crop) match.crop = crop.toLowerCase();

  const heatmap = await PriceRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { district: '$market.district', state: '$market.state' },
        avgModal: { $avg: '$modalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.state': 1, '_id.district': 1 } },
  ]);

  return {
    items: heatmap.map((h) => ({
      district: h._id.district,
      state: h._id.state,
      avgModalPrice: Math.round(h.avgModal * 100) / 100,
      recordCount: h.count,
    })),
  };
}

module.exports = {
  getLatestPrices,
  getTrends,
  compareCrops,
  getMandis,
  getMandisGeo,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  upsertPriceRecord,
  resyncPrices,
  getPriceHeatmap,
  cacheGet,
  cacheSet,
};
