import api from "./axios";

export const socialAPI = {
  getAll: () => api.get("/social-accounts"),

  connect: (provider) => api.post("/social-accounts/connect", { provider }),

  callback: (provider, code) =>
    api.post("/social-accounts/callback", { provider, code }),

  disconnect: (id) => api.delete(`/social-accounts/${id}`),

  sync: (id) => api.post(`/social-accounts/${id}/sync`),

  getProfile: (id) => api.get(`/social-accounts/${id}/profile`),

  getProjects: (id) => api.get(`/social-accounts/${id}/projects`),
};

export default socialAPI;
