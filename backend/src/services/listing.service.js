/**
 * Listing service (Phase 02) — crop-lot CRUD, public search with filters,
 * owner stats, soft-delete and image bookkeeping. Controllers stay thin;
 * ownership is enforced by middleware/ownership.js, which attaches the loaded
 * document (`req.listing`) for the owner-only operations below.
 */
const CropListing = require('../models/crop-listing.model');
const Fpo = require('../models/fpo.model');
const ApiError = require('../../common/utils/ApiError');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priceAsc: { pricePerUnit: 1 },
  priceDesc: { pricePerUnit: -1 },
  qtyAsc: { 'quantity.value': 1 },
  qtyDesc: { 'quantity.value': -1 },
};

const POPULATE_FARMER = { path: 'farmerId', select: 'name location' };
const POPULATE_FPO = { path: 'fpoId', select: 'name verified' };

/** Crop names are stored trimmed + lowercased for consistent filtering. */
const normalizeCrop = (crop) => String(crop).trim().toLowerCase();

function buildFilter({ crop, district, organic, status, minQty, priceMin, priceMax }) {
  const filter = { deletedAt: null };
  // Public lists never surface drafts unless a status is explicitly requested.
  filter.status = status || { $ne: 'draft' };
  if (crop) filter.crop = { $regex: escapeRegex(crop), $options: 'i' };
  if (district) filter['location.district'] = { $regex: escapeRegex(district), $options: 'i' };
  if (organic !== undefined) filter.organic = organic;
  if (minQty !== undefined) filter['quantity.value'] = { $gte: minQty };
  if (priceMin !== undefined || priceMax !== undefined) {
    filter.pricePerUnit = {};
    if (priceMin !== undefined) filter.pricePerUnit.$gte = priceMin;
    if (priceMax !== undefined) filter.pricePerUnit.$lte = priceMax;
  }
  return filter;
}

/**
 * Full-text-ish search filter (Phase 03). Combines `buildFilter` with an `$or`
 * clause that matches `q` against the crop name, variety and district — the
 * buyer-facing "search bar" behaviour, on top of the exact filters below.
 */
function buildSearchFilter({ q, crop, district, organic, status, minQty, priceMin, priceMax }) {
  const filter = buildFilter({ crop, district, organic, status, minQty, priceMin, priceMax });
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: 'i' };
    filter.$and = [{ $or: [{ crop: regex }, { variety: regex }, { 'location.district': regex }] }];
  }
  return filter;
}

/** API shape: farmer + fpo flattened in, `isOwner` when a user is present. */
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

/** Resolve + verify the optional fpoId belongs to the caller. */
async function resolveFpoId(user, fpoId) {
  if (fpoId === undefined || fpoId === null) return null;
  const fpo = await Fpo.findOne({ _id: fpoId, createdBy: user._id });
  if (!fpo) throw ApiError.badRequest('fpoId must be one of your FPOs');
  return fpoId;
}

/** POST /listings */
async function createListing(user, data) {
  const fpoId = await resolveFpoId(user, data.fpoId);
  const listing = await CropListing.create({
    farmerId: user._id,
    fpoId: fpoId || undefined,
    crop: normalizeCrop(data.crop),
    variety: data.variety,
    grade: data.grade,
    organic: data.organic || false,
    quantity: data.quantity,
    priceType: data.priceType || 'fixed',
    pricePerUnit: data.pricePerUnit || 0,
    mandiRef: data.mandiRef,
    readinessDate: data.readinessDate ? new Date(data.readinessDate) : undefined,
    location: data.location,
    status: data.status || 'active',
  });
  await listing.populate([POPULATE_FARMER, POPULATE_FPO]);
  return shapeListing(listing, user);
}

/** GET /listings (public, filterable + paginated). */
async function listListings(query, user) {
  const { crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit } = query;
  const filter = buildFilter({ crop, district, organic, status, minQty, priceMin, priceMax });
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

/** GET /listings/search (Phase 03) — buyer-facing search, same envelope. */
async function searchListings(query, user) {
  const { q, crop, district, organic, status, minQty, priceMin, priceMax, sort, page, limit } =
    query;
  const filter = buildSearchFilter({
    q,
    crop,
    district,
    organic,
    status,
    minQty,
    priceMin,
    priceMax,
  });
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

/** GET /listings/:id — public; drafts visible only to their owner/admin. */
async function getListing(id, user) {
  const listing = await CropListing.findById(id).populate(POPULATE_FARMER).populate(POPULATE_FPO);
  if (!listing || listing.deletedAt) throw ApiError.notFound('Listing not found');
  const isOwner = user ? String(listing.farmerId._id) === String(user._id) : false;
  if (listing.status === 'draft' && !isOwner && user?.role !== 'admin') {
    throw ApiError.notFound('Listing not found');
  }
  return shapeListing(listing, user);
}

/** PATCH /listings/:id — operates on the pre-loaded, owned document. */
async function updateListing(listing, patch) {
  if (patch.crop !== undefined) listing.crop = normalizeCrop(patch.crop);
  if (patch.variety !== undefined) listing.variety = patch.variety || undefined;
  if (patch.grade !== undefined) listing.grade = patch.grade;
  if (patch.organic !== undefined) listing.organic = patch.organic;
  if (patch.quantity !== undefined) listing.quantity = patch.quantity;
  if (patch.priceType !== undefined) listing.priceType = patch.priceType;
  if (patch.pricePerUnit !== undefined) listing.pricePerUnit = patch.pricePerUnit;
  if (patch.mandiRef !== undefined) listing.mandiRef = patch.mandiRef || undefined;
  if (patch.readinessDate !== undefined && patch.readinessDate !== null) {
    listing.readinessDate = new Date(patch.readinessDate);
  } else if (patch.readinessDate === null) {
    listing.readinessDate = undefined;
  }
  if (patch.location !== undefined) {
    listing.location = {
      village: listing.location.village,
      district: listing.location.district,
      state: listing.location.state,
      geo: listing.location.geo,
      ...patch.location,
    };
  }
  if (patch.status !== undefined) listing.status = patch.status;
  if (patch.fpoId !== undefined && patch.fpoId !== null) {
    // Ownership of the FPO is verified inside resolveFpoId via createdBy.
    const fpo = await Fpo.findOne({ _id: patch.fpoId, createdBy: listing.farmerId });
    if (!fpo) throw ApiError.badRequest('fpoId must be one of your FPOs');
    listing.fpoId = patch.fpoId;
  } else if (patch.fpoId === null) {
    listing.fpoId = undefined;
  }

  // Business rule: a fixed price always needs a positive pricePerUnit.
  if (listing.priceType === 'fixed' && (!listing.pricePerUnit || listing.pricePerUnit <= 0)) {
    throw ApiError.badRequest(
      'pricePerUnit is required (and greater than 0) when priceType is fixed'
    );
  }

  await listing.save();
  await listing.populate([POPULATE_FARMER, POPULATE_FPO]);
  return shapeListing(listing);
}

/** DELETE /listings/:id — soft-delete (retires the listing). */
async function softDelete(listing) {
  listing.deletedAt = new Date();
  listing.status = 'draft';
  await listing.save();
}

/** POST /listings/:id/images — append uploads, capped at 5 total. */
async function addImages(listing, urls) {
  if (listing.images.length + urls.length > 5) {
    throw ApiError.badRequest('A listing can have at most 5 images');
  }
  listing.images = [...listing.images, ...urls];
  await listing.save();
  await listing.populate([POPULATE_FARMER, POPULATE_FPO]);
  return shapeListing(listing);
}

/** GET /farmer/me/listings — own listings (any status) + simple stats. */
async function getMyListings(user, query) {
  const { status, page, limit } = query;
  const filter = { farmerId: user._id, deletedAt: null };
  if (status) filter.status = status;

  const [docs, total, agg] = await Promise.all([
    CropListing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_FARMER)
      .populate(POPULATE_FPO),
    CropListing.countDocuments(filter),
    CropListing.aggregate([
      { $match: { farmerId: user._id, deletedAt: null } },
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
          priceSum: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$pricePerUnit', 0] },
          },
          priceCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const g = agg[0] || { active: 0, sold: 0, priceSum: 0, priceCount: 0 };
  const stats = {
    active: g.active,
    sold: g.sold,
    avgPrice: g.priceCount > 0 ? Math.round((g.priceSum / g.priceCount) * 100) / 100 : 0,
  };

  return {
    items: docs.map((doc) => shapeListing(doc, user)),
    page,
    limit,
    total,
    stats,
  };
}

module.exports = {
  createListing,
  listListings,
  searchListings,
  getListing,
  updateListing,
  softDelete,
  addImages,
  getMyListings,
  buildFilter, // exported for unit verification (scripts)
  buildSearchFilter, // exported for unit verification (scripts)
  normalizeCrop,
};
