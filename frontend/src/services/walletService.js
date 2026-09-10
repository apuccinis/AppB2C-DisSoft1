import api, { unwrap } from './api.js';

export const fetchPortfolio = () => api.get('/wallets').then(unwrap);

export const fetchWallet = (asset) => api.get(`/wallets/${asset}`).then((res) => unwrap(res).wallet);
