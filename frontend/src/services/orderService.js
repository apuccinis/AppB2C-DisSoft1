import api, { unwrap } from './api.js';

export const previewOrder = (payload) =>
  api.post('/orders/preview', payload).then((res) => unwrap(res).preview);

export const createOrder = (payload) => api.post('/orders', payload).then(unwrap);

export const fetchOrders = (filters = {}) => {
  const params = {};
  if (filters.type) params.type = filters.type;
  if (filters.asset) params.asset = filters.asset;
  return api.get('/orders', { params }).then((res) => unwrap(res).orders || []);
};

export const fetchOrder = (id) => api.get(`/orders/${id}`).then((res) => unwrap(res).order);
