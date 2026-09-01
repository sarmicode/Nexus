/**
 * Listing image upload (Phase 02) — Multer configured for the local dev
 * storage at backend/uploads/listings/.
 *
 * Rules enforced here (docs/phases/PHASE-02-farmer-module.md):
 * - jpg / png / webp only (by MIME type),
 * - ≤ 3 MB each,
 * - max 5 files per request,
 * - random filenames (extension derived from the whitelisted MIME type, never
 *   from the client-supplied name).
 *
 * Deployed environments should point storage at Cloudinary (free tier) instead
 * of the ephemeral local disk — see docs/FREE_TIER_PLAN.md.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../../common/utils/ApiError');

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'listings');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** Pure predicate (unit-testable): is this MIME type an allowed image? */
function isAllowedImageMime(mime) {
  return Boolean(MIME_EXT[mime]);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${MIME_EXT[file.mimetype]}`),
});

const fileFilter = (req, file, cb) => {
  if (isAllowedImageMime(file.mimetype)) return cb(null, true);
  cb(
    new ApiError.badRequest(
      `Unsupported image type "${file.mimetype || 'unknown'}" — allowed: jpg, png, webp`
    )
  );
};

const uploadListingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 5 },
});

module.exports = { uploadListingImages, isAllowedImageMime, UPLOAD_DIR };
