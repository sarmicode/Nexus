/**
 * Buyer service (Phase 03) — watchlist, saved searches, leads/RFQs, search.
 */
const CropListing = require('../models/crop-listing.model');
const Watchlist = require('../models/watchlist.model');
const SavedSearch = require('../models/saved-search.model');
const Lead = require('../models/lead.model');
const ApiError = require('../../common/utils/ApiError');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priceAsc: { pricePerUnit: 1 },
  priceDesc: { pricePerUnit: -1 },
  quantityDesc: { 'quantity.value': -1 },
};

const POPULATE_FARMER = { path: 'farmerId', select: 'name location' };
const POPULATE_FPO = { path: 'fpoId', select: 'name verified' };

function shapeListing(listing, user) {
  const farmer = listing.farmerId;
  const fpo = listing.fpoId;
  const isOwner = user ? String(farmer && farmer._id) === String(user._id) : false;
  return {
    _id: listing._id.toString(),
    crop: listing.crop,
    variety: listing.variety,
    grade: listing.grade,
    organic: listing.organic,
    quantity: listing.quantity,
    priceType: listing.priceType,
    pricePerUnit: listing.pricePerUnit,
    mandiRef: listing.mandiRef,
    readinessDate: listing.readinessDate,
    location: listing.location,
    images: listing.images,
    status: listing.status,
    fpoId: fpo ? fpo._id.toString() : null,
    farmer: farmer
      ? {
          _id: farmer._id.toString(),
          name: farmer.name,
          village: farmer.location && farmer.location.village,
          district: farmer.location && farmer.location.district,
          state: farmer.location && farmer.location.state,
        }
      : null,
    fpo: fpo ? { _id: fpo._id.toString(), name: fpo.name, verified: fpo.verified } : null,
    isOwner,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

// ── Search ──────────────────────────────────────────────────────────────
async function searchListings(query, user) {
  const { q, crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit } =
    query;
  const filter = { deletedAt: null, status: status || { $ne: 'draft' } };

  if (q) {
    const regex = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ crop: regex }, { variety: regex }, { 'location.district': regex }];
  }
  if (crop) filter.crop = { $regex: escapeRegex(crop), $options: 'i' };
  if (district) filter['location.district'] = { $regex: escapeRegex(district), $options: 'i' };
  if (organic !== undefined) filter.organic = organic;
  if (minQty !== undefined) filter['quantity.value'] = { $gte: minQty };
  if (priceMin !== undefined || priceMax !== undefined) {
    filter.pricePerUnit = {};
    if (priceMin !== undefined) filter.pricePerUnit.$gte = priceMin;
    if (priceMax !== undefined) filter.pricePerUnit.$lte = priceMax;
  }

  const [docs, total] = await Promise.all([
    CropListing.find(filter)
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_FARMER)
      .populate(POPULATE_FPO),
    CropListing.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => shapeListing(doc, user)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Watchlist ───────────────────────────────────────────────────────────
async function addToWatchlist(user, data) {
  const listing = await CropListing.findOne({
    _id: data.listingId,
    deletedAt: null,
    status: { $ne: 'draft' },
  });
  if (!listing) throw ApiError.notFound('Listing not found');

  const existing = await Watchlist.findOne({
    buyerId: user._id,
    listingId: data.listingId,
  });
  if (existing) {
    if (data.note !== undefined) existing.note = data.note;
    await existing.save();
    return existing.toObject();
  }

  const entry = await Watchlist.create({
    buyerId: user._id,
    listingId: data.listingId,
    note: data.note || '',
  });
  return entry.toObject();
}

async function getWatchlist(user, query) {
  const { page, limit } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    Watchlist.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'listingId',
        populate: [POPULATE_FARMER, POPULATE_FPO],
      }),
    Watchlist.countDocuments(filter),
  ]);

  const items = docs
    .filter((d) => d.listingId)
    .map((d) => ({
      _id: d._id.toString(),
      note: d.note,
      createdAt: d.createdAt,
      listing: shapeListing(d.listingId, user),
    }));

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function removeFromWatchlist(user, watchlistId) {
  const entry = await Watchlist.findOneAndDelete({
    _id: watchlistId,
    buyerId: user._id,
  });
  if (!entry) throw ApiError.notFound('Watchlist entry not found');
  return { message: 'Removed from watchlist' };
}

// ── Saved Searches ──────────────────────────────────────────────────────
async function createSavedSearch(user, data) {
  const search = await SavedSearch.create({
    buyerId: user._id,
    name: data.name || '',
    query: data.query,
    alertsEnabled: data.alertsEnabled !== false,
  });
  return search.toObject();
}

async function getSavedSearches(user, query) {
  const { page, limit } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    SavedSearch.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    SavedSearch.countDocuments(filter),
  ]);
  return { items: docs.map((d) => d.toObject()), page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function deleteSavedSearch(user, searchId) {
  const entry = await SavedSearch.findOneAndDelete({
    _id: searchId,
    buyerId: user._id,
  });
  if (!entry) throw ApiError.notFound('Saved search not found');
  return { message: 'Saved search deleted' };
}

// ── Leads / RFQs ────────────────────────────────────────────────────────
async function createLead(user, listingId, data) {
  const listing = await CropListing.findOne({
    _id: listingId,
    deletedAt: null,
    status: 'active',
  });
  if (!listing) throw ApiError.notFound('Active listing not found');

  // Block duplicate lead from same buyer to same listing within 24 hours.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicate = await Lead.findOne({
    buyerId: user._id,
    listingId,
    createdAt: { $gte: dayAgo },
  });
  if (duplicate) {
    throw ApiError.conflict('You already sent an enquiry for this listing in the last 24 hours');
  }

  const lead = await Lead.create({
    listingId,
    buyerId: user._id,
    message: data.message,
    quantityWanted: data.quantityWanted,
    priceOffered: data.priceOffered,
  });
  await lead.populate([
    { path: 'listingId', populate: [POPULATE_FARMER] },
    { path: 'buyerId', select: 'name phone' },
  ]);
  return lead.toObject();
}

async function getFarmerLeads(farmerUser, query) {
  const { status, page, limit } = query;
  // Find all listing IDs owned by this farmer.
  const listings = await CropListing.find({
    farmerId: farmerUser._id,
    deletedAt: null,
  }).select('_id');
  const listingIds = listings.map((l) => l._id);

  const filter = { listingId: { $in: listingIds } };
  if (status) filter.status = status;

  const [docs, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'listingId', select: 'crop pricePerUnit quantity status location' })
      .populate({ path: 'buyerId', select: 'name phone email' }),
    Lead.countDocuments(filter),
  ]);

  return { items: docs.map((d) => d.toObject()), page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function getBuyerLeads(user, query) {
  const { page, limit } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'listingId', select: 'crop pricePerUnit quantity status location farmerId', populate: POPULATE_FARMER }),
    Lead.countDocuments(filter),
  ]);
  return { items: docs.map((d) => d.toObject()), page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function updateLeadStatus(leadId, farmerUser, data) {
  // Verify the lead belongs to a listing owned by this farmer.
  const lead = await Lead.findById(leadId).populate('listingId');
  if (!lead) throw ApiError.notFound('Lead not found');
  if (!lead.listingId) throw ApiError.notFound('Listing not found');
  if (String(lead.listingId.farmerId) !== String(farmerUser._id) && farmerUser.role !== 'admin') {
    throw ApiError.forbidden('This enquiry is not for your listing');
  }
  lead.status = data.status;
  await lead.save();
  return lead.toObject();
}

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
