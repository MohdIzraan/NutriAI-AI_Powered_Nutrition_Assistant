import api from './api';

export const analyticsService = {
  getSummary: () => api.get('/analytics/summary'),
  getWeekly: () => api.get('/analytics/weekly'),
  getRecommendations: () => api.get('/analytics/recommendations'),
};
