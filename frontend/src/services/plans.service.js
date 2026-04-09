import api from './api';

export const plansService = {
  // Admin
  getAll: async () => {
    const res = await api.get('/plans');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/plans', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/plans/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/plans/${id}`);
  },

  getSubscribers: async () => {
    const res = await api.get('/plans/subscribers');
    return res.data;
  },

  getPlanServices: async (planId) => {
    const res = await api.get(`/plans/${planId}/services`);
    return res.data;
  },

  addPlanService: async (planId, serviceId, priceOverride) => {
    const res = await api.post(`/plans/${planId}/services`, { serviceId, priceOverride });
    return res.data;
  },

  removePlanService: async (planId, serviceId) => {
    await api.delete(`/plans/${planId}/services/${serviceId}`);
  },

  // Public (customer) — aceita ID ou slug
  getPublicPlans: async (establishmentIdOrSlug) => {
    // Se tiver hífens ou letras minúsculas sem ser UUID, é slug; caso contrário tenta ID
    const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(establishmentIdOrSlug);
    const url = isSlug
      ? `/subscriptions/public/slug/${establishmentIdOrSlug}`
      : `/subscriptions/public/${establishmentIdOrSlug}`;
    const res = await api.get(url);
    return res.data;
  },
};

export const subscriptionsService = {
  getMine: async () => {
    const res = await api.get('/subscriptions/mine');
    return res.data;
  },

  subscribe: async (planId) => {
    const res = await api.post('/subscriptions', { plan_id: planId });
    return res.data;
  },

  cancel: async (id) => {
    const res = await api.patch(`/subscriptions/${id}/cancel`);
    return res.data;
  },
};
