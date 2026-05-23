import api from "./axios";

const dashboardAPI = {
  getStats: (year = new Date().getFullYear()) => {
    return api.get("/admin/dashboard", { params: { year } });
  },
};

export default dashboardAPI;
