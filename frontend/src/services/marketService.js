import api, { unwrap } from './api.js';

export const fetchAssets = () => api.get('/assets').then((res) => unwrap(res).assets || []);

export const fetchPrices = () => api.get('/prices').then((res) => unwrap(res).prices || []);

export const fetchPrice = (asset) => api.get(`/prices/${asset}`).then((res) => unwrap(res).price);

export const fetchHistory = (asset, range = '24H') =>
  api.get(`/prices/${asset}/history`, { params: { range } }).then(unwrap);

export const fetchHealth = () => api.get('/health').then(unwrap);
