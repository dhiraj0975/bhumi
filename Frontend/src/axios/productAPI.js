import { api } from "./axios";

// ✅ Product API calls
const productAPI = {
  create: (data) => api.post("/products", data),
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

export default productAPI;
