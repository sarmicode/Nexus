/**
 * Market controller (Phase 04) — price queries, alerts, admin resync.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const priceService = require('../services/mandi/priceService');

const getLatestPrices = asyncHandler(async (req, res) => {
  const data = await priceService.getLatestPrices(req.validated.query);
  res.json({ success: true, data });
});

const getTrends = asyncHandler(async (req, res) => {
  const data = await priceService.getTrends(req.params.crop, req.validated.query);
  res.json({ success: true, data });
});

const compareCrops = asyncHandler(async (req, res) => {
  const data = await priceService.compareCrops(req.validated.query);
  res.json({ success: true, data });
});

const getMandis = asyncHandler(async (req, res) => {
  const data = await priceService.getMandis(req.validated.query);
  res.json({ success: true, data });
});

const getMandisGeo = asyncHandler(async (req, res) => {
  const data = await priceService.getMandisGeo();
  res.json({ success: true, data });
});

const createPriceAlert = asyncHandler(async (req, res) => {
  const data = await priceService.createPriceAlert(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

const getPriceAlerts = asyncHandler(async (req, res) => {
  const data = await priceService.getPriceAlerts(req.user);
  res.json({ success: true, data });
});

const deletePriceAlert = asyncHandler(async (req, res) => {
  const data = await priceService.deletePriceAlert(req.user, req.params.id);
  res.json({ success: true, data });
});

const resyncPrices = asyncHandler(async (req, res) => {
  const data = await priceService.resyncPrices(req.validated.body);
  res.json({ success: true, data });
});

const getPriceHeatmap = asyncHandler(async (req, res) => {
  const data = await priceService.getPriceHeatmap(req.query.crop);
  res.json({ success: true, data });
});

module.exports = {
  getLatestPrices,
  getTrends,
  compareCrops,
  getMandis,
  getMandisGeo,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  resyncPrices,
  getPriceHeatmap,
};
