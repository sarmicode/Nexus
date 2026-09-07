/**
 * Analytics controller (Phase 07).
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const analyticsService = require('../services/analytics.service');
const adminService = require('../services/admin.service');
const logisticsService = require('../services/logistics.service');
const priceService = require('../services/mandi/priceService');
const ApiError = require('../../common/utils/ApiError');

// Analytics.
const getFarmerAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getFarmerAnalytics(req.user);
  res.json({ success: true, data });
});

const getBuyerAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBuyerAnalytics(req.user);
  res.json({ success: true, data });
});

const getAdminOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminOverview();
  res.json({ success: true, data });
});

// Admin.
const listUsers = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers(req.validated.query);
  res.json({ success: true, data });
});

const updateUser = asyncHandler(async (req, res) => {
  const data = await adminService.updateUser(req.user, req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const blockUser = asyncHandler(async (req, res) => {
  const data = await adminService.blockUser(req.user, req.params.id);
  res.json({ success: true, data });
});

const unblockUser = asyncHandler(async (req, res) => {
  const data = await adminService.unblockUser(req.user, req.params.id);
  res.json({ success: true, data });
});

const verifyFpo = asyncHandler(async (req, res) => {
  const data = await adminService.verifyFpo(req.user, req.params.id);
  res.json({ success: true, data });
});

const getDisputes = asyncHandler(async (req, res) => {
  const data = await adminService.getDisputes(req.validated.query);
  res.json({ success: true, data });
});

const resolveDispute = asyncHandler(async (req, res) => {
  const data = await adminService.resolveDispute(req.user, req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const qualityCheck = asyncHandler(async (req, res) => {
  const data = await adminService.qualityCheck(req.user, req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const getAuditLog = asyncHandler(async (req, res) => {
  const data = await adminService.getAuditLog(req.validated.query);
  res.json({ success: true, data });
});

// Logistics.
const estimateLogistics = asyncHandler(async (req, res) => {
  const { from, to, qtyTonnes } = req.query;
  if (!from || !to) throw ApiError.badRequest('from and to query params are required');
  const fromCoords = from.split(',').map(Number);
  const toCoords = to.split(',').map(Number);
  const data = logisticsService.estimateLogistics(fromCoords, toCoords, parseFloat(qtyTonnes) || 1);
  res.json({ success: true, data });
});

const optimizeRoute = asyncHandler(async (req, res) => {
  const { stops } = req.validated.body;
  const coords = stops.map((s) => [s.lat, s.lng]);
  const data = logisticsService.optimizeRoute(coords);
  res.json({ success: true, data });
});

// Price heatmap (used by maps).
const getPriceHeatmap = asyncHandler(async (req, res) => {
  const data = await priceService.getPriceHeatmap(req.query.crop);
  res.json({ success: true, data });
});

module.exports = {
  getFarmerAnalytics,
  getBuyerAnalytics,
  getAdminOverview,
  listUsers,
  updateUser,
  blockUser,
  unblockUser,
  verifyFpo,
  getDisputes,
  resolveDispute,
  qualityCheck,
  getAuditLog,
  estimateLogistics,
  optimizeRoute,
  getPriceHeatmap,
};
