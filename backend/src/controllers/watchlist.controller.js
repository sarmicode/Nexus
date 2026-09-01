/**
 * Watchlist controller — thin request handling; logic lives in watchlist.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const watchlistService = require('../services/watchlist.service');

// POST /api/v1/watchlist
const addToWatchlist = asyncHandler(async (req, res) => {
  const data = await watchlistService.addToWatchlist(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

// GET /api/v1/watchlist
const listWatchlist = asyncHandler(async (req, res) => {
  const data = await watchlistService.listWatchlist(req.user, req.validated.query);
  res.status(200).json({ success: true, data });
});

// DELETE /api/v1/watchlist/:listingId
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const data = await watchlistService.removeFromWatchlist(req.user, req.params.listingId);
  res.status(200).json({ success: true, data });
});

module.exports = { addToWatchlist, listWatchlist, removeFromWatchlist };
