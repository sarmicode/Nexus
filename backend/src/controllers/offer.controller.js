/**
 * Offer controller (Phase 06).
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const offerService = require('../services/offer.service');

const createOffer = asyncHandler(async (req, res) => {
  const data = await offerService.createOffer(req.user, req.params.id, req.validated.body);
  res.status(201).json({ success: true, data });
});

const counterOffer = asyncHandler(async (req, res) => {
  const data = await offerService.counterOffer(req.user, req.params.id, req.validated.body);
  res.status(201).json({ success: true, data });
});

const acceptOffer = asyncHandler(async (req, res) => {
  const data = await offerService.acceptOffer(req.user, req.params.id);
  res.json({ success: true, data });
});

const rejectOffer = asyncHandler(async (req, res) => {
  const data = await offerService.rejectOffer(req.user, req.params.id);
  res.json({ success: true, data });
});

const withdrawOffer = asyncHandler(async (req, res) => {
  const data = await offerService.withdrawOffer(req.user, req.params.id);
  res.json({ success: true, data });
});

const getMyOffers = asyncHandler(async (req, res) => {
  const data = await offerService.getMyOffers(req.user, req.validated.query);
  res.json({ success: true, data });
});

module.exports = {
  createOffer,
  counterOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  getMyOffers,
};
