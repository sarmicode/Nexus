/**
 * /users routes — profile (authenticated) + admin-only user list (Phase 01).
 */
const { Router } = require('express');
const { getMe, updateMe, listUsers } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const validate = require('../middleware/validate');
const { patchMeSchema, listUsersQuery } = require('../validators/user.validator');

const router = Router();

router.use(authenticate); // everything under /users requires a valid access token

router.get('/me', getMe);
router.patch('/me', validate({ body: patchMeSchema }), updateMe);
router.get('/', requireRole('admin'), validate({ query: listUsersQuery }), listUsers);

module.exports = router;
