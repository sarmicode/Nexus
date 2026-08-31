/**
 * Indian mobile phone helpers — shared by validators, services and the
 * admin seed script.
 *
 * Accepted input formats: 9876543210 · +91 98765 43210 · 0091-9876543210
 * Stored form: 10 digits, starting 6-9 (TRAI mobile numbering plan).
 */

function normalizePhone(input) {
  let s = String(input || '').replace(/[\s\-().]/g, '');
  if (s.startsWith('+91')) s = s.slice(3);
  else if (s.startsWith('0091')) s = s.slice(4);
  else if (s.startsWith('91') && s.length === 12) s = s.slice(2);
  return s;
}

function isValidIndianPhone(input) {
  return /^[6-9]\d{9}$/.test(normalizePhone(input));
}

module.exports = { normalizePhone, isValidIndianPhone };
