const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const listingRoutes = require('./listing.routes');
const fpoRoutes = require('./fpo.routes');
const farmerRoutes = require('./farmer.routes');
const buyerRoutes = require('./buyer.routes');
const leadRoutes = require('./lead.routes');
const marketRoutes = require('./market.routes');
const matchingRoutes = require('./matching.routes');
const offerRoutes = require('./offer.routes');
const orderRoutes = require('./order.routes');
const adminRoutes = require('./admin.routes');
const adminPriceRoutes = require('./admin-price.routes');

const router = Router();

// /api/v1 — every versioned API route is mounted here (RULES.md §4).
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/fpos', fpoRoutes);
router.use('/farmer', farmerRoutes);

// Phase 03 — Buyer module.
router.use('/buyer', buyerRoutes);
router.use('/farmer/leads', leadRoutes);

// Phase 04 — Market intelligence.
router.use('/market', marketRoutes);

// Phase 05 — Matching & recommendations.
router.use('/', matchingRoutes);

// Phase 06 — Offers, orders, payments, notifications.
router.use('/', offerRoutes);
router.use('/', orderRoutes);

// Phase 07 — Analytics, admin, logistics.
router.use('/', adminRoutes);
router.use('/admin', adminPriceRoutes);

module.exports = router;
