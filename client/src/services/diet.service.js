import api from './api';

export const dietService = {
  generate: (data) => api.post('/diet/generate', data),
  getAll: () => api.get('/diet'),
  getActive: () => api.get('/diet/active'),
  getOne: (id) => api.get(`/diet/${id}`),
  modify: (id, instruction) => api.put(`/diet/${id}/modify`, { instruction }),
  delete: (id) => api.delete(`/diet/${id}`),
};
