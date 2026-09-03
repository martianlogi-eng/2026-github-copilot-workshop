import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const AUTH_SCHEME = 'Bearer';

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `${AUTH_SCHEME} ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getDashboard: async () => {
    const requisitions = await apiFetch('/api/requisitions');
    const items = requisitions.items || [];

    return {
      totalPr: items.length,
      draftPr: items.filter((item) => item.status === 'DRAFT').length,
      submittedPr: items.filter((item) => item.status === 'SUBMITTED').length,
      approvedPr: items.filter((item) => item.status === 'APPROVED').length,
      recentPr: items.slice(0, 5),
    };
  },
  listRequisitions: () => apiFetch('/api/requisitions'),
  createRequisition: (payload) =>
    apiFetch('/api/requisitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRequisition: (id) => apiFetch(`/api/requisitions/${id}`),
  submitRequisition: (id) =>
    apiFetch(`/api/requisitions/${id}/submit`, {
      method: 'POST',
    }),
  approveRequisition: (id) =>
    apiFetch(`/api/requisitions/${id}/approve`, {
      method: 'POST',
    }),
  getRequisitionOpenLines: (id) => apiFetch(`/api/requisitions/${id}/open-lines`),

  login: (username) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  listPurchaseOrders: () => apiFetch('/api/purchase-orders'),
  getPurchaseOrder: (id) => apiFetch(`/api/purchase-orders/${id}`),

  listGoodsReceipts: () => apiFetch('/api/goods-receipts'),

  listBookmarks: () => apiFetch('/api/bookmarks'),
  createBookmark: (entityType, entityId) =>
    apiFetch('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId }),
    }),
  deleteBookmark: (id) =>
    apiFetch(`/api/bookmarks/${id}`, {
      method: 'DELETE',
    }),
};
