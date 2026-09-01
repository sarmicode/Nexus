/**
 * User service — profile reads/updates and the admin user list (Phase 01).
 */
const User = require('../models/user.model');

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, value]) => value !== undefined));

/** GET /users/me */
async function getMe(user) {
  return user.toPublic();
}

/** PATCH /users/me — name / language / location (partial updates). */
async function updateMe(user, { name, language, location }) {
  if (name !== undefined) user.name = name;
  if (language !== undefined) user.language = language;
  if (location !== undefined) {
    const current = user.location ? user.location.toObject() : {};
    user.location = { ...current, ...stripUndefined(location) };
  }
  await user.save();
  return user.toPublic();
}

/** GET /users — admin-only paginated list. */
async function listUsers({ page, limit }) {
  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(),
  ]);
  return { users: users.map((user) => user.toPublic()), total, page, limit };
}

module.exports = { getMe, updateMe, listUsers };
