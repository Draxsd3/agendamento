import api from './api';

export const financialService = {
  getSummary: async (params) => {
    const res = await api.get('/financial/summary', { params });
    return res.data;
  },

  getRevenueByDay: async (params) => {
    const res = await api.get('/financial/revenue-by-day', { params });
    return res.data;
  },

  getRevenueByBranch: async (params) => {
    const res = await api.get('/financial/revenue-by-branch', { params });
    return res.data;
  },

  getRevenueByProfessional: async (params) => {
    const res = await api.get('/financial/revenue-by-professional', { params });
    return res.data;
  },

  getRevenueByService: async (params) => {
    const res = await api.get('/financial/revenue-by-service', { params });
    return res.data;
  },

  getTransactions: async (params) => {
    const res = await api.get('/financial/transactions', { params });
    return res.data;
  },

  updatePaymentMethod: async (appointmentId, paymentMethod) => {
    const res = await api.patch(`/financial/transactions/${appointmentId}/payment-method`, {
      payment_method: paymentMethod,
    });
    return res.data;
  },

  getAsaasSubaccount: async (params) => {
    const res = await api.get('/financial/asaas-subaccount', { params });
    return res.data;
  },

  syncAsaasSubaccount: async () => {
    const res = await api.post('/financial/asaas-subaccount/sync');
    return res.data;
  },

  updateAsaasBillingSettings: async (billingMode) => {
    const res = await api.patch('/financial/asaas-subaccount/billing-settings', {
      billing_mode: billingMode,
    });
    return res.data;
  },
};
