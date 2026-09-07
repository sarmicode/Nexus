/**
 * Buyer controller (Phase 03) — thin handler; logic in buyer.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const buyerService = require('../services/buyer.service');

const searchListings = asyncHandler(async (req, res) => {
  const data = await buyerService.searchListings(req.validated.query, req.user);
  res.json({ success: true, data });
});

const addToWatchlist = asyncHandler(async (req, res) => {
  const data = await buyerService.addToWatchlist(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

const getWatchlist = asyncHandler(async (req, res) => {
  const data = await buyerService.getWatchlist(req.user, req.validated.query);
  res.json({ success: true, data });
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  const data = await buyerService.removeFromWatchlist(req.user, req.params.id);
  res.json({ success: true, data });
});

const createSavedSearch = asyncHandler(async (req, res) => {
  const data = await buyerService.createSavedSearch(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

const getSavedSearches = asyncHandler(async (req, res) => {
  const data = await buyerService.getSavedSearches(req.user, req.validated.query);
  res.json({ success: true, data });
});

const deleteSavedSearch = asyncHandler(async (req, res) => {
  const data = await buyerService.deleteSavedSearch(req.user, req.params.id);
  res.json({ success: true, data });
});

const createLead = asyncHandler(async (req, res) => {
  const data = await buyerService.createLead(req.user, req.params.id, req.validated.body);
  res.status(201).json({ success: true, data });
});

const getFarmerLeads = asyncHandler(async (req, res) => {
  const data = await buyerService.getFarmerLeads(req.user, req.validated.query);
  res.json({ success: true, data });
});

const getBuyerLeads = asyncHandler(async (req, res) => {
  const data = await buyerService.getBuyerLeads(req.user, req.validated.query);
  res.json({ success: true, data });
});

const updateLeadStatus = asyncHandler(async (req, res) => {
  const data = await buyerService.updateLeadStatus(req.params.id, req.user, req.validated.body);
  res.json({ success: true, data });
});

module.exports = {
  searchListings,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
  createLead,
  getFarmerLeads,
  getBuyerLeads,
  updateLeadStatus,
};
