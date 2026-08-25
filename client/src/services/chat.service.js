import api from './api';

export const chatService = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: (params) => api.get('/chat/history', { params }),
  getChat: (id) => api.get(`/chat/${id}`),
  deleteChat: (id) => api.delete(`/chat/${id}`),
};
