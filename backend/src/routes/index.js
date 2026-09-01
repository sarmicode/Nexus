const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const listingRoutes = require('./listing.routes');
const fpoRoutes = require('./fpo.routes');
const farmerRoutes = require('./farmer.routes');

const router = Router();

// /api/v1 — every versioned API route is mounted here (RULES.md §4).
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/fpos', fpoRoutes);
router.use('/farmer', farmerRoutes);

module.exports = router;
