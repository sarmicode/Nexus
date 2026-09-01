/**
 * FPO service (Phase 02) — create, list, read, update Farmer Producer
 * Organisations. Ownership is enforced by middleware/ownership.js, which
 * attaches the loaded document (`req.fpo`) for owner-only updates.
 */
const Fpo = require('../models/fpo.model');
const ApiError = require('../../common/utils/ApiError');

function shapeFpo(fpo, user) {
  return {
    _id: fpo._id.toString(),
    name: fpo.name,
    registrationNo: fpo.registrationNo,
    district: fpo.district,
    state: fpo.state,
    memberCount: fpo.memberCount,
    contactPhone: fpo.contactPhone,
    verified: fpo.verified,
    isOwner: user ? String(fpo.createdBy) === String(user._id) : false,
    createdAt: fpo.createdAt,
    updatedAt: fpo.updatedAt,
  };
}

/** POST /fpos */
async function createFpo(user, data) {
  const fpo = await Fpo.create({ ...data, createdBy: user._id });
  return shapeFpo(fpo, user);
}

/** GET /fpos (public, filterable + paginated). */
async function listFpos(query, user) {
  const { district, state, page, limit } = query;
  const filter = {};
  if (district) filter.district = { $regex: district, $options: 'i' };
  if (state) filter.state = { $regex: state, $options: 'i' };
  const [docs, total] = await Promise.all([
    Fpo.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Fpo.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => shapeFpo(doc, user)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** GET /fpos/:id */
async function getFpo(id, user) {
  const fpo = await Fpo.findById(id);
  if (!fpo) throw ApiError.notFound('FPO not found');
  return shapeFpo(fpo, user);
}

/** PATCH /fpos/:id — operates on the pre-loaded, owned document. */
async function updateFpo(fpo, patch) {
  if (patch.name !== undefined) fpo.name = patch.name;
  if (patch.registrationNo !== undefined) fpo.registrationNo = patch.registrationNo;
  if (patch.district !== undefined) fpo.district = patch.district;
  if (patch.state !== undefined) fpo.state = patch.state;
  if (patch.memberCount !== undefined) fpo.memberCount = patch.memberCount;
  if (patch.contactPhone !== undefined) fpo.contactPhone = patch.contactPhone || undefined;
  await fpo.save();
  return shapeFpo(fpo);
}

/** GET /farmer/me/fpos — the caller's own FPOs (for the listing form). */
async function listMyFpos(user) {
  const docs = await Fpo.find({ createdBy: user._id }).sort({ createdAt: -1 });
  return { items: docs.map((doc) => shapeFpo(doc, user)) };
}

// Referenced above through ApiError for the not-found helper.
module.exports = { createFpo, listFpos, getFpo, updateFpo, listMyFpos };
