import api from './api';

export const establishmentsService = {
  getAll: async (params) => {
    const res = await api.get('/super-admin/establishments', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/super-admin/establishments/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/super-admin/establishments/${id}`, data);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/super-admin/establishments', data);
    return res.data;
  },

  setStatus: async (id, status) => {
    const res = await api.patch(`/super-admin/establishments/${id}/status`, { status });
    return res.data;
  },

  getMine: async () => {
    const res = await api.get('/establishments/me');
    return res.data;
  },

  updateMine: async (data) => {
    const res = await api.put('/establishments/me', data);
    return res.data;
  },

  uploadLogo: async ({ fileName, contentType, base64 }) => {
    const res = await api.post('/establishments/me/logo', { fileName, contentType, base64 });
    return res.data;
  },

  uploadCover: async ({ fileName, contentType, base64 }) => {
    const res = await api.post('/establishments/me/cover', { fileName, contentType, base64 });
    return res.data;
  },
};

export const publicEstablishmentsService = {
  getBySlug: async (slug) => {
    const res = await api.get(`/public/establishments/${slug}`);
    return res.data;
  },

  getServices: async (id) => {
    const res = await api.get(`/public/establishments/${id}/services`);
    return res.data;
  },

  getProfessionals: async (id) => {
    const res = await api.get(`/public/establishments/${id}/professionals`);
    return res.data;
  },

  getBusinessHours: async (id) => {
    const res = await api.get(`/public/establishments/${id}/business-hours`);
    return res.data;
  },

  getSlots: async (id, params) => {
    const res = await api.get(`/public/establishments/${id}/slots`, { params });
    return res.data;
  },

  getBranches: async (id) => {
    const res = await api.get(`/public/establishments/${id}/branches`);
    return res.data;
  },
};
