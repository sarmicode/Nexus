const { Router } = require('express');
const healthRoutes = require('./health.routes');

const router = Router();

// /api/v1 — every versioned API route is mounted here (RULES.md §4).
router.use('/', healthRoutes);

module.exports = router;
