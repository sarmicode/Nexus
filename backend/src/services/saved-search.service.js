/**
 * SavedSearch service (Phase 03 — Buyer Module).
 *
 * Stores the query params from the Catalog/search page so the search can be
 * recreated exactly. A user owns their saved searches (created by / read for
 * that user only); Phase 4 wires `alertsEnabled` into price alerts.
 */
const SavedSearch = require('../models/saved-search.model');
const ApiError = require('../../common/utils/ApiError');

function shapeSearch(search) {
  return {
    _id: search._id.toString(),
    query: search.query,
    alertsEnabled: search.alertsEnabled,
    createdAt: search.createdAt,
    updatedAt: search.updatedAt,
  };
}

/** POST /saved-searches */
async function createSavedSearch(user, { query, alertsEnabled }) {
  const search = await SavedSearch.create({
    buyerId: user._id,
    query,
    alertsEnabled: alertsEnabled || false,
  });
  return shapeSearch(search);
}

/** GET /saved-searches (paginated). */
async function listSavedSearches(user, query) {
  const { page, limit } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    SavedSearch.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SavedSearch.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => shapeSearch(doc)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** DELETE /saved-searches/:id — owner only. */
async function deleteSavedSearch(user, id) {
  const search = await SavedSearch.findOne({ _id: id, buyerId: user._id });
  if (!search) throw ApiError.notFound('Saved search not found');
  await search.deleteOne();
  return { message: 'Saved search deleted' };
}

module.exports = { createSavedSearch, listSavedSearches, deleteSavedSearch };
