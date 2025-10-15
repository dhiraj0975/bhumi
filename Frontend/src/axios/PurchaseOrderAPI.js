import { api } from "./axios";

// ✅ Purchase Order API
const PurchaseOrderAPI = {
  getAll: () => api.get("/purchase-orders"),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post("/purchase-orders", data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  getInvoice: (id) => api.get(`/purchase-orders/${id}/invoice`),
};
export default PurchaseOrderAPI;
