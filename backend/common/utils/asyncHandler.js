/**
 * Route handler wrapper — forwards rejected promises into Express' error
 * pipeline so async controllers fail cleanly instead of crashing the process.
 *
 *   router.get('/health', asyncHandler(getHealth));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
