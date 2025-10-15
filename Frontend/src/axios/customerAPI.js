// src/axios/customerAPI.js
import { api } from "./axios";

// Optional: unify error messages by wrapping responses (we keep using api instance)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject({ ...err, message: msg });
  }
);

const customersAPI = {
  // CRUD
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),

  // Status/Balance
  toggleStatus: (id, currentStatus) => api.put(`/customers/${id}/toggle-status`, { currentStatus }),
  getBalance: (id) => api.get(`/customers/${id}/balance`),

  // Statement + Summary
  getStatement: (id, params) => api.get(`/customers/${id}/statement`, { params }),
  getSummary: (id, params) => api.get(`/customers/${id}/summary`, { params }),

  // Exports
  exportStatementCSV: (id, params) => api.get(`/customers/${id}/statement.csv`, { params, responseType: "blob" }),
  exportStatementPDF: (id, params) => api.get(`/customers/${id}/statement.pdf`, { params, responseType: "blob" }),
};

export default customersAPI;
