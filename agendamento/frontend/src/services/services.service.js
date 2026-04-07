import api from './api';

export const servicesService = {
  getAll: async () => {
    const res = await api.get('/services');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/services', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/services/${id}`);
  },
};
