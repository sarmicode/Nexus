/**
 * Auth controller — thin request handling; logic lives in auth.service.
 */
const asyncHandler = require('../../common/utils/asyncHandler');
const authService = require('../services/auth.service');

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.validated.body);
  res.status(201).json({ success: true, data });
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.validated.body);
  res.status(200).json({ success: true, data });
});

// POST /api/v1/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.validated.body.refreshToken);
  res.status(200).json({ success: true, data });
});

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);
  res.status(200).json({ success: true, data: { message: 'Logged out' } });
});

module.exports = { register, login, refresh, logout };
