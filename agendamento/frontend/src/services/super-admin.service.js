import api from './api';

export const superAdminService = {
  getDashboard: async () => {
    const res = await api.get('/super-admin/dashboard');
    return res.data;
  },

  getAllUsers: async (params) => {
    const res = await api.get('/super-admin/users', { params });
    return res.data;
  },

  createAdminUser: async (data) => {
    const res = await api.post('/super-admin/users/admin', data);
    return res.data;
  },

  toggleUserStatus: async (userId) => {
    const res = await api.patch(`/super-admin/users/${userId}/toggle-status`);
    return res.data;
  },
};
