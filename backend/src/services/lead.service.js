/**
 * Lead service (Phase 03 — Buyer Module) — buy-intent / RFQ flow.
 *
 * - A buyer sends an enquiry on a listing (`POST /listings/:id/leads`).
 * - A farmer reads all leads on their listings (`GET /farmer/me/leads`).
 * - A farmer moves a lead through its status (`PATCH /leads/:id`).
 *
 * Anti-spam: exactly one lead per buyer+listing within a 24 h window, and a
 * route-level strict limiter on creation (see lead.routes.js).
 */
const Lead = require('../models/lead.model');
const CropListing = require('../models/crop-listing.model');
const ApiError = require('../../common/utils/ApiError');

const DUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const POPULATE_LISTING = {
  path: 'listingId',
  select: 'crop variety status quantity location images',
  populate: { path: 'farmerId', select: 'name location' },
};
const POPULATE_BUYER = { path: 'buyerId', select: 'name phone location' };

function shapeLead(lead) {
  const listing = lead.listingId;
  const buyer = lead.buyerId;
  return {
    _id: lead._id.toString(),
    listingId: listing ? listing._id.toString() : null,
    listing: listing
      ? {
          _id: listing._id.toString(),
          crop: listing.crop,
          variety: listing.variety,
          status: listing.status,
          quantity: listing.quantity,
          images: listing.images,
          district: listing.location && listing.location.district,
          state: listing.location && listing.location.state,
        }
      : null,
    buyer: buyer
      ? {
          _id: buyer._id.toString(),
          name: buyer.name,
          phone: buyer.phone,
          district: buyer.location && buyer.location.district,
          state: buyer.location && buyer.location.state,
        }
      : null,
    message: lead.message,
    quantityWanted: lead.quantityWanted,
    quantityUnit: lead.quantityUnit,
    priceOffered: lead.priceOffered ?? null,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

/** POST /listings/:id/leads — buyer expresses interest in an active listing. */
async function createLead(user, listingId, data) {
  const listing = await CropListing.findOne({ _id: listingId, deletedAt: null });
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.status !== 'active')
    throw ApiError.badRequest('This listing is not accepting enquiries');

  // Anti-spam: one lead per buyer+listing in 24h.
  const since = new Date(Date.now() - DUP_WINDOW_MS);
  const existing = await Lead.findOne({ listingId, buyerId: user._id, createdAt: { $gte: since } });
  if (existing) {
    throw ApiError.conflict('You already enquired about this listing within the last 24 hours');
  }

  const lead = await Lead.create({
    listingId,
    buyerId: user._id,
    message: data.message,
    quantityWanted: data.quantityWanted,
    quantityUnit: data.quantityUnit,
    priceOffered: data.priceOffered,
  });
  await lead.populate([POPULATE_LISTING, POPULATE_BUYER]);
  return shapeLead(lead);
}

/** GET /farmer/me/leads — the farmer's inbox (leads on any of their listings). */
async function listFarmerLeads(user, query) {
  const { status, page, limit } = query;
  const listings = await CropListing.find({ farmerId: user._id }).select('_id');
  const listingIds = listings.map((l) => l._id);
  const filter = { listingId: { $in: listingIds } };
  if (status) filter.status = status;

  const [docs, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_LISTING)
      .populate(POPULATE_BUYER),
    Lead.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => shapeLead(doc)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** PATCH /leads/:id — operates on the pre-loaded, authorized lead (req.lead). */
async function updateLeadStatus(lead, status) {
  lead.status = status;
  await lead.save();
  await lead.populate([POPULATE_LISTING, POPULATE_BUYER]);
  return shapeLead(lead);
}

/** GET /leads/me — the buyer's own enquiries (Buyer Dashboard). */
async function listMyLeads(user, query) {
  const { status, page, limit } = query;
  const filter = { buyerId: user._id };
  if (status) filter.status = status;
  const [docs, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_LISTING)
      .populate(POPULATE_BUYER),
    Lead.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => shapeLead(doc)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { createLead, listFarmerLeads, updateLeadStatus, listMyLeads };
