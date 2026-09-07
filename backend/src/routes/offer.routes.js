/**
 * Offer routes (Phase 06).
 */
const { Router } = require('express');
const {
  createOffer,
  counterOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  getMyOffers,
} = require('../controllers/offer.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createOfferSchema,
  counterOfferSchema,
  offersQuery,
  idParams,
} = require('../validators/order.validator');

const router = Router();

router.post(
  '/listings/:id/offers',
  authenticate,
  validate({ params: idParams, body: createOfferSchema }),
  createOffer
);
router.post(
  '/offers/:id/counter',
  authenticate,
  validate({ params: idParams, body: counterOfferSchema }),
  counterOffer
);
router.post(
  '/offers/:id/accept',
  authenticate,
  validate({ params: idParams }),
  acceptOffer
);
router.post(
  '/offers/:id/reject',
  authenticate,
  validate({ params: idParams }),
  rejectOffer
);
router.post(
  '/offers/:id/withdraw',
  authenticate,
  validate({ params: idParams }),
  withdrawOffer
);
router.get(
  '/offers',
  authenticate,
  validate({ query: offersQuery }),
  getMyOffers
);

module.exports = router;
