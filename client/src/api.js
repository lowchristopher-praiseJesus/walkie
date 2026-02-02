const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Volunteers
  getVolunteers: () => fetchJSON('/volunteers'),
  addVolunteer: (data) => fetchJSON('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  updateVolunteer: (id, data) => fetchJSON(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolunteer: (id) => fetchJSON(`/volunteers/${id}`, { method: 'DELETE' }),

  // Walkies
  getWalkies: () => fetchJSON('/walkies'),
  addWalkie: (data) => fetchJSON('/walkies', { method: 'POST', body: JSON.stringify(data) }),
  updateWalkie: (id, data) => fetchJSON(`/walkies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWalkie: (id) => fetchJSON(`/walkies/${id}`, { method: 'DELETE' }),
  signOutWalkie: (walkieId, volunteerId) => fetchJSON('/walkies/sign-out', { method: 'POST', body: JSON.stringify({ walkieId, volunteerId }) }),
  returnWalkie: (id) => fetchJSON(`/walkies/return/${id}`, { method: 'POST' }),
  resetWalkies: () => fetchJSON('/walkies/reset', { method: 'POST' }),

  // Admin
  verifyPin: (pin) => fetchJSON('/admin/verify', { method: 'POST', body: JSON.stringify({ pin }) }),
  getConfig: () => fetchJSON('/admin/config'),
  updateConfig: (data) => fetchJSON('/admin/config', { method: 'PUT', body: JSON.stringify(data) }),
};
