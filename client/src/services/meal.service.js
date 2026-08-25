import api from './api';

export const mealService = {
  create: (data) => api.post('/meals', data),
  getAll: (params) => api.get('/meals', { params }),
  getOne: (id) => api.get(`/meals/${id}`),
  update: (id, data) => api.put(`/meals/${id}`, data),
  delete: (id) => api.delete(`/meals/${id}`),
  getTodaySummary: () => api.get('/meals/today/summary'),
};
