import api from './api';

export const asaasService = {
  getSubaccount: (sync = false) =>
    api.get('/asaas', { params: { sync } }).then((r) => r.data),

  createSubaccount: (data) =>
    api.post('/asaas', data).then((r) => r.data),

  syncSubaccount: () =>
    api.post('/asaas/sync').then((r) => r.data),

  updateBillingMode: (billingMode) =>
    api.patch('/asaas/billing-mode', { billingMode }).then((r) => r.data),
};
