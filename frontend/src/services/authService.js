import api, { unwrap } from './api.js';

export const registerRequest = (payload) =>
  api.post('/auth/register', payload).then(unwrap);

export const loginRequest = (payload) => api.post('/auth/login', payload).then(unwrap);

export const meRequest = () => api.get('/auth/me').then(unwrap);
