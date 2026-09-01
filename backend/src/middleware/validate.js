/**
 * validate — zod input validation at the route level (RULES.md §4).
 *
 *   router.post('/register', validate({ body: registerSchema }), handler);
 *
 * Parsed (and coerced) values replace the raw ones on `req.validated`.
 * Errors use the standard VALIDATION_ERROR envelope with field paths.
 */
const ApiError = require('../../common/utils/ApiError');

const validate = (schemas) => (req, res, next) => {
  const validated = {};
  for (const key of ['params', 'query', 'body']) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key] ?? {});
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path);
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join('; ');
      return next(ApiError.badRequest(message));
    }
    validated[key] = result.data;
  }
  req.validated = validated;
  return next();
};

module.exports = validate;
