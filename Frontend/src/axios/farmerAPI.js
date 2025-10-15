import { api } from "./axios";

// ✅ Farmer API calls
const farmerAPI = {
  create: (data) => api.post("/farmers", data),
  getAll: () => api.get("/farmers"),
  update: (id, data) => api.put(`/farmers/${id}`, data),
  remove: (id) => api.delete(`/farmers/${id}`),
  updateStatus: (id, status) => api.patch(`/farmers/${id}/status`, { status }),
};

export default farmerAPI;

