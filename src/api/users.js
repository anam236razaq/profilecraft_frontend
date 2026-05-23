import api from "./axios";

const usersAPI = {
  getAll: (params = {}) => {
    return api.get("/admin/users", { params });
  },
  toggleStatus: (id, isActive) => {
    return api.put(`/admin/users/${id}/toggle`, { is_active: isActive });
  },
};

export default usersAPI;
