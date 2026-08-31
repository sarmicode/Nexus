/**
 * Health controller — thin request handling only (RULES.md §4).
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const { getHealthReport } = require('../services/health.service');

// GET /api/v1/health
const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: getHealthReport() });
});

module.exports = { getHealth };
