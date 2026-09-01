import api from './api';

/**
 * Lead / RFQ API calls (Phase 03 — Buyer Module).
 */
export async function createLead(listingId, payload) {
  const { data } = await api.post(`/listings/${listingId}/leads`, payload);
  return data.data;
}

export async function listFarmerLeads(params) {
  const { data } = await api.get('/farmer/me/leads', { params });
  return data.data;
}

export async function listMyLeads(params) {
  const { data } = await api.get('/leads/me', { params });
  return data.data;
}

export async function updateLeadStatus(id, status) {
  const { data } = await api.patch(`/leads/${id}`, { status });
  return data.data;
}
