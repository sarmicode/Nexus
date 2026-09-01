/**
 * SavedSearch controller — thin request handling; logic lives in saved-search.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const savedSearchService = require('../services/saved-search.service');

// POST /api/v1/saved-searches
const createSavedSearch = asyncHandler(async (req, res) => {
  const data = await savedSearchService.createSavedSearch(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

// GET /api/v1/saved-searches
const listSavedSearches = asyncHandler(async (req, res) => {
  const data = await savedSearchService.listSavedSearches(req.user, req.validated.query);
  res.status(200).json({ success: true, data });
});

// DELETE /api/v1/saved-searches/:id
const deleteSavedSearch = asyncHandler(async (req, res) => {
  const data = await savedSearchService.deleteSavedSearch(req.user, req.params.id);
  res.status(200).json({ success: true, data });
});

module.exports = { createSavedSearch, listSavedSearches, deleteSavedSearch };
