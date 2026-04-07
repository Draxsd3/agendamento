import api from './api';

export const adminService = {
  getEstablishment: async (id) => {
    const res = await api.get(`/establishments/${id}`);
    return res.data;
  },
};
