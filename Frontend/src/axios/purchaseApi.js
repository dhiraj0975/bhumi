// src/api/purchase.api.js
import { api } from "./axios";

const PurchaseAPI = {
  getAll: () => api.get("/purchase"),
  getById: (id) => api.get(`/purchase/${id}`),
  create: (data) => api.post("/purchase", data),
  update: (id, data) => api.put(`/purchase/${id}`, data),
  delete: (id) => api.delete(`/purchase/${id}`),
 // NEW
  getPOForPurchase: (poId) => api.get(`/purchase-orders/${poId}/for-purchase`),
};

export default PurchaseAPI;
