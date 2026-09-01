/**
 * FPO controller — thin request handling; logic lives in fpo.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const fpoService = require('../services/fpo.service');

// POST /api/v1/fpos
const createFpo = asyncHandler(async (req, res) => {
  const data = await fpoService.createFpo(req.user, req.validated.body);
  res.status(201).json({ success: true, data });
});

// GET /api/v1/fpos
const listFpos = asyncHandler(async (req, res) => {
  const data = await fpoService.listFpos(req.validated.query, req.user);
  res.status(200).json({ success: true, data });
});

// GET /api/v1/fpos/:id
const getFpo = asyncHandler(async (req, res) => {
  const data = await fpoService.getFpo(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

// PATCH /api/v1/fpos/:id
const updateFpo = asyncHandler(async (req, res) => {
  const data = await fpoService.updateFpo(req.fpo, req.validated.body);
  res.status(200).json({ success: true, data });
});

module.exports = { createFpo, listFpos, getFpo, updateFpo };
