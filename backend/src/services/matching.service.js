/**
 * Matching service (Phase 05) — demand CRUD + matching engine wrappers.
 */
const BuyerDemand = require('../models/buyer-demand.model');
const ApiError = require('../../common/utils/ApiError');
const engine = require('./matching/engine');

async function createDemand(user, data) {
  const demand = await BuyerDemand.create({
    buyerId: user._id,
    cropsWanted: data.cropsWanted.map((c) => c.toLowerCase().trim()),
    quantityNeeded: data.quantityNeeded,
    districts: data.districts || [],
    maxDistanceKm: data.maxDistanceKm,
    budgetPerUnit: data.budgetPerUnit,
    buyerType: data.buyerType || 'consumer',
    active: true,
  });
  return demand.toObject();
}

async function getDemands(user, query) {
  const { page = 1, limit = 20 } = query;
  const filter = { buyerId: user._id };
  const [docs, total] = await Promise.all([
    BuyerDemand.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BuyerDemand.countDocuments(filter),
  ]);
  return { items: docs.map((d) => d.toObject()), page, limit, total, totalPages: Math.ceil(total / limit) };
}

async function updateDemand(user, demandId, patch) {
  const demand = await BuyerDemand.findOne({ _id: demandId, buyerId: user._id });
  if (!demand) throw ApiError.notFound('Demand not found');
  if (patch.cropsWanted) demand.cropsWanted = patch.cropsWanted.map((c) => c.toLowerCase().trim());
  if (patch.quantityNeeded) demand.quantityNeeded = patch.quantityNeeded;
  if (patch.districts) demand.districts = patch.districts;
  if (patch.maxDistanceKm !== undefined) demand.maxDistanceKm = patch.maxDistanceKm;
  if (patch.budgetPerUnit !== undefined) demand.budgetPerUnit = patch.budgetPerUnit;
  if (patch.buyerType) demand.buyerType = patch.buyerType;
  if (patch.active !== undefined) demand.active = patch.active;
  await demand.save();
  return demand.toObject();
}

module.exports = {
  createDemand,
  getDemands,
  updateDemand,
  ...engine,
};
