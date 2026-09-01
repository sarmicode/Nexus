import api from './api';

/**
 * GET /api/v1/health → { status, uptime, ts, db }
 */
export async function fetchHealth() {
  const { data } = await api.get('/health');
  if (!data || !data.success) {
    throw new Error('Unexpected health response shape');
  }
  return data.data;
}
