import api from './api';

export const appointmentsService = {
  getByEstablishment: async (establishmentId, params) => {
    const res = await api.get(`/appointments/establishment/${establishmentId}`, { params });
    return res.data;
  },

  getMyAppointments: async () => {
    const res = await api.get('/appointments/my');
    return res.data;
  },

  book: async (data) => {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  reschedule: async (id, data) => {
    const res = await api.patch(`/appointments/${id}/reschedule`, data);
    return res.data;
  },

  cancel: async (id) => {
    const res = await api.patch(`/appointments/${id}/cancel`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/appointments/${id}/status`, { status });
    return res.data;
  },
};
