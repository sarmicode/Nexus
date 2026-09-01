/**
 * Health service — gateway liveness + dependency state.
 */
const { getDbState } = require('../config/db');

/** @returns {{ status: string, uptime: number, ts: string, db: string }} */
function getHealthReport() {
  return {
    status: 'ok',
    uptime: Math.round(process.uptime()), // seconds
    ts: new Date().toISOString(),
    db: getDbState(),
  };
}

module.exports = { getHealthReport };
