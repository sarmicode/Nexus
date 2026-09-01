/**
 * Lead controller — thin request handling; logic lives in lead.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const leadService = require('../services/lead.service');

// POST /api/v1/listings/:id/leads — buyer sends an enquiry (RFQ).
const createLead = asyncHandler(async (req, res) => {
  const data = await leadService.createLead(req.user, req.params.id, req.validated.body);
  res.status(201).json({ success: true, data });
});

// GET /api/v1/farmer/me/leads — farmer's enquiry inbox.
const listFarmerLeads = asyncHandler(async (req, res) => {
  const data = await leadService.listFarmerLeads(req.user, req.validated.query);
  res.status(200).json({ success: true, data });
});

// GET /api/v1/leads/me — buyer's own enquiries (Buyer Dashboard).
const listMyLeads = asyncHandler(async (req, res) => {
  const data = await leadService.listMyLeads(req.user, req.validated.query);
  res.status(200).json({ success: true, data });
});

// PATCH /api/v1/leads/:id — farmer moves a lead's status (req.lead attached by
// requireLeadOwner in middleware/ownership.js).
const updateLeadStatus = asyncHandler(async (req, res) => {
  const data = await leadService.updateLeadStatus(req.lead, req.validated.body.status);
  res.status(200).json({ success: true, data });
});

module.exports = { createLead, listFarmerLeads, listMyLeads, updateLeadStatus };
