import { api } from "./axios";

// ✅ Category API calls
const categoryAPI = {
  create: (data) => api.post("/categories", data),
  getAll: () => api.get("/categories"),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
  updateStatus: (id, status) => api.patch(`/categories/${id}/status`, { status }),
};

export default categoryAPI;
