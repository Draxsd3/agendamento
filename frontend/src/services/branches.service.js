import api from './api';

export const branchesService = {
  getAll: async () => {
    const res = await api.get('/branches');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/branches', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/branches/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/branches/${id}`);
  },
};
