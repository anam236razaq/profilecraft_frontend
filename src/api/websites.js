import api from './axios';

export const websitesAPI = {
  getAll: () =>
    api.get('/websites'),

  getById: (id) =>
    api.get(`/websites/${id}`),

  create: (data) =>
    api.post('/websites', data),

  update: (id, data) =>
    api.put(`/websites/${id}`, data),

  delete: (id) =>
    api.delete(`/websites/${id}`),

  publish: (id) =>
    api.post(`/websites/${id}/publish`),
};

export default websitesAPI;
