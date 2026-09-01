/**
 * User controller — thin request handling; logic lives in user.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const userService = require('../services/user.service');

// GET /api/v1/users/me
const getMe = asyncHandler(async (req, res) => {
  const data = await userService.getMe(req.user);
  res.status(200).json({ success: true, data });
});

// PATCH /api/v1/users/me
const updateMe = asyncHandler(async (req, res) => {
  const data = await userService.updateMe(req.user, req.validated.body);
  res.status(200).json({ success: true, data });
});

// GET /api/v1/users (admin only)
const listUsers = asyncHandler(async (req, res) => {
  const data = await userService.listUsers(req.validated.query);
  res.status(200).json({ success: true, data });
});

module.exports = { getMe, updateMe, listUsers };
