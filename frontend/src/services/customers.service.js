import api from './api';

export const customersService = {
  getProfile: async () => {
    const res = await api.get('/customers/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/customers/profile', data);
    return res.data;
  },

  // Returns establishments the customer has booked at, each with active plans
  getMyEstablishments: async () => {
    const res = await api.get('/customers/my-establishments');
    return res.data;
  },
};
