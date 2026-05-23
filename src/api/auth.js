import api from "./axios";

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (data) => api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get("/auth/me"),

  updateProfile: (data) => api.post("/profile", data),

  updatePassword: (data) => api.put("/profile/password", data),
};

export default authAPI;
