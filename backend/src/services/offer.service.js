/**
 * Offer service (Phase 06) — offer/counter-offer/accept/reject with state checks.
 */
const Offer = require('../models/offer.model');
const CropListing = require('../models/crop-listing.model');
const notify = require('./notify.service');
const ApiError = require('../../common/utils/ApiError');

async function createOffer(buyerUser, listingId, data) {
  const listing = await CropListing.findOne({
    _id: listingId,
    deletedAt: null,
    status: 'active',
  });
  if (!listing) throw ApiError.notFound('Active listing not found');
  if (String(listing.farmerId) === String(buyerUser._id)) {
    throw ApiError.badRequest('You cannot make an offer on your own listing');
  }

  const offer = await Offer.create({
    listingId,
    farmerId: listing.farmerId,
    buyerId: buyerUser._id,
    quantity: data.quantity,
    pricePerUnit: data.pricePerUnit,
    message: data.message || '',
    side: 'buyer',
    status: 'pending',
    parentId: data.parentId || null,
  });

  await offer.populate([
    { path: 'listingId', select: 'crop pricePerUnit quantity location farmerId' },
    { path: 'buyerId', select: 'name phone' },
    { path: 'farmerId', select: 'name phone' },
  ]);

  await notify.createNotification({
    userId: listing.farmerId,
    type: 'offer_received',
    title: 'New offer received',
    body: `${buyerUser.name} offered ₹${data.pricePerUnit}/unit for your ${listing.crop} listing`,
    refType: 'offer',
    refId: offer._id,
  });

  return offer.toObject();
}

async function counterOffer(user, offerId, data) {
  const original = await Offer.findById(offerId).populate('listingId');
  if (!original) throw ApiError.notFound('Offer not found');
  if (original.status !== 'pending') {
    throw ApiError.conflict(`Cannot counter a ${original.status} offer`);
  }

  const isParticipant =
    String(original.farmerId) === String(user._id) ||
    String(original.buyerId) === String(user._id);
  if (!isParticipant) throw ApiError.forbidden('You are not a participant in this offer');

  original.status = 'countered';
  await original.save();

  const counterSide = String(original.farmerId) === String(user._id) ? 'farmer' : 'buyer';
  const counter = await Offer.create({
    listingId: original.listingId._id || original.listingId,
    farmerId: original.farmerId,
    buyerId: original.buyerId,
    quantity: data.quantity || original.quantity,
    pricePerUnit: data.pricePerUnit,
    message: data.message || '',
    side: counterSide,
    status: 'pending',
    parentId: original._id,
  });

  const counterpartyId = counterSide === 'farmer' ? original.buyerId : original.farmerId;
  await notify.createNotification({
    userId: counterpartyId,
    type: 'offer_countered',
    title: 'Counter offer received',
    body: `${user.name} countered with ₹${data.pricePerUnit}/unit`,
    refType: 'offer',
    refId: counter._id,
  });

  await counter.populate([
    { path: 'listingId', select: 'crop pricePerUnit quantity' },
    { path: 'buyerId', select: 'name phone' },
    { path: 'farmerId', select: 'name phone' },
  ]);
  return counter.toObject();
}

async function acceptOffer(user, offerId) {
  const offer = await Offer.findById(offerId).populate('listingId');
  if (!offer) throw ApiError.notFound('Offer not found');
  if (offer.status !== 'pending') {
    throw ApiError.conflict(`Cannot accept a ${offer.status} offer`);
  }
  const isParticipant =
    String(offer.farmerId) === String(user._id) ||
    String(offer.buyerId) === String(user._id);
  if (!isParticipant) throw ApiError.forbidden('You are not a participant in this offer');

  offer.status = 'accepted';
  await offer.save();

  const counterpartyId = String(offer.farmerId) === String(user._id) ? offer.buyerId : offer.farmerId;
  await notify.createNotification({
    userId: counterpartyId,
    type: 'offer_accepted',
    title: 'Offer accepted',
    body: `${user.name} accepted your offer`,
    refType: 'offer',
    refId: offer._id,
  });

  return offer.toObject();
}

async function rejectOffer(user, offerId) {
  const offer = await Offer.findById(offerId);
  if (!offer) throw ApiError.notFound('Offer not found');
  if (offer.status !== 'pending') {
    throw ApiError.conflict(`Cannot reject a ${offer.status} offer`);
  }
  const isFarmer = String(offer.farmerId) === String(user._id);
  if (!isFarmer && user.role !== 'admin') {
    throw ApiError.forbidden('Only the farmer can reject an offer');
  }
  offer.status = 'rejected';
  await offer.save();

  await notify.createNotification({
    userId: offer.buyerId,
    type: 'offer_rejected',
    title: 'Offer rejected',
    body: 'Your offer has been declined',
    refType: 'offer',
    refId: offer._id,
  });

  return offer.toObject();
}

async function withdrawOffer(user, offerId) {
  const offer = await Offer.findById(offerId);
  if (!offer) throw ApiError.notFound('Offer not found');
  if (offer.status !== 'pending') {
    throw ApiError.conflict(`Cannot withdraw a ${offer.status} offer`);
  }
  if (String(offer.buyerId) !== String(user._id)) {
    throw ApiError.forbidden('Only the buyer can withdraw an offer');
  }
  offer.status = 'withdrawn';
  await offer.save();
  return offer.toObject();
}

async function getMyOffers(user, query) {
  const { page = 1, limit = 20, side = 'all' } = query;
  const filter = {};
  if (side === 'sent') {
    filter.buyerId = user._id;
  } else if (side === 'received') {
    filter.farmerId = user._id;
  } else {
    filter.$or = [{ buyerId: user._id }, { farmerId: user._id }];
  }
  const [docs, total] = await Promise.all([
    Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'listingId', select: 'crop pricePerUnit quantity location status' })
      .populate({ path: 'buyerId', select: 'name phone' })
      .populate({ path: 'farmerId', select: 'name phone' }),
    Offer.countDocuments(filter),
  ]);
  return {
    items: docs.map((d) => d.toObject()),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  createOffer,
  counterOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  getMyOffers,
};
