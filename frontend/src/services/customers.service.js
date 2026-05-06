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

  getByEstablishment: async (establishmentId, params = {}) => {
    const res = await api.get(`/customers/establishment/${establishmentId}`, { params });
    return res.data;
  },

  createForEstablishment: async (establishmentId, data) => {
    const res = await api.post(`/customers/establishment/${establishmentId}`, data);
    return res.data;
  },

  getEstablishmentCustomerDetail: async (establishmentId, customerId) => {
    const res = await api.get(`/customers/establishment/${establishmentId}/${customerId}`);
    return res.data;
  },
};
