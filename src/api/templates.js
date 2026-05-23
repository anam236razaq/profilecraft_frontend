import api from "./axios";

export const templatesAPI = {
  getAll: (params = {}) => {
    const { search = "", page = 1, per_page = 12, category = "" } = params;
    return api.get("/templates", {
      params: { search, page, per_page, category },
    });
  },

  getById: (id) => api.get(`/templates/${id}`),

  // Admin methods
  getAdminAll: (params = {}) => {
    const { search = "", page = 1, per_page = 12 } = params;
    return api.get("/admin/templates", { params: { search, page, per_page } });
  },

  create: (data) => api.post("/admin/templates", data),

  update: (id, data) => api.put(`/admin/templates/${id}`, data),

  delete: (id) => api.delete(`/admin/templates/${id}`),
};

export default templatesAPI;
