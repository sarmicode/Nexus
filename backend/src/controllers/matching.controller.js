/**
 * Matching controller (Phase 05).
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const matchingService = require('../services/matching.service');

const createDemand = asyncHandler(async (req, res) => {
  const data = await matchingService.createDemand(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

const getDemands = asyncHandler(async (req, res) => {
  const data = await matchingService.getDemands(req.user, req.validated.query);
  res.json({ success: true, data });
});

const updateDemand = asyncHandler(async (req, res) => {
  const data = await matchingService.updateDemand(req.user, req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const getMatchesForListing = asyncHandler(async (req, res) => {
  const data = await matchingService.getMatchesForListing(req.params.id);
  res.json({ success: true, data });
});

const getMatchesForDemand = asyncHandler(async (req, res) => {
  const data = await matchingService.getMatchesForDemand(req.params.id);
  res.json({ success: true, data });
});

const getFeed = asyncHandler(async (req, res) => {
  const data = await matchingService.getPersonalizedFeed(req.user._id);
  res.json({ success: true, data });
});

module.exports = {
  createDemand,
  getDemands,
  updateDemand,
  getMatchesForListing,
  getMatchesForDemand,
  getFeed,
};
