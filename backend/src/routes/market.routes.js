/**
 * Market routes (Phase 04) — prices, trends, compare, alerts, mandis.
 */
const { Router } = require('express');
const {
  getLatestPrices,
  getTrends,
  compareCrops,
  getMandis,
  getMandisGeo,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  resyncPrices,
  getPriceHeatmap,
} = require('../controllers/market.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const {
  latestPricesQuery,
  trendsQuery,
  compareQuery,
  mandisQuery,
  createPriceAlertSchema,
  resyncBody,
  cropParams,
  idParams,
} = require('../validators/market.validator');

const router = Router();

// Public endpoints.
router.get('/prices/latest', validate({ query: latestPricesQuery }), getLatestPrices);
router.get('/prices/trends/:crop', validate({ params: cropParams, query: trendsQuery }), getTrends);
router.get('/prices/compare', validate({ query: compareQuery }), compareCrops);
router.get('/prices/heatmap', getPriceHeatmap);

// Mandi directory + geo.
router.get('/mandis', validate({ query: mandisQuery }), getMandis);
router.get('/mandis/geo', getMandisGeo);

// Alerts — authenticated users.
router.post(
  '/alerts',
  authenticate,
  validate({ body: createPriceAlertSchema }),
  createPriceAlert
);
router.get('/alerts', authenticate, getPriceAlerts);
router.delete('/alerts/:id', authenticate, validate({ params: idParams }), deletePriceAlert);

module.exports = router;
