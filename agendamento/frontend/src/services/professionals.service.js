import api from './api';

export const professionalsService = {
  getAll: async (establishmentId) => {
    const res = await api.get('/professionals', { params: { establishmentId } });
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/professionals', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/professionals/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/professionals/${id}`);
  },

  addService: async (id, serviceId) => {
    const res = await api.post(`/professionals/${id}/services`, { service_id: serviceId });
    return res.data;
  },

  removeService: async (id, serviceId) => {
    await api.delete(`/professionals/${id}/services/${serviceId}`);
  },
};
