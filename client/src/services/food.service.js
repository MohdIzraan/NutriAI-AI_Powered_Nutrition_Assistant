import api from './api';

export const foodService = {
  analyzeImage: (formData) =>
    api.post('/food/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    }),
  getAnalysis: (id) => api.get(`/food/analysis/${id}`),
};
