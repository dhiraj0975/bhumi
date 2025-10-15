import { api } from "./axios";

// ---------- SALES ORDERS ----------
export const soApi = {
  list: () => api.get("/so-orders"),
  get: (id) => api.get(`/so-orders/${id}`),
  create: (data) => api.post("/so-orders", data),
  update: (id, data) => api.put(`/so-orders/${id}`, data),
  remove: (id) => api.delete(`/so-orders/${id}`),
  invoice: (id) => api.get(`/so-orders/${id}/invoice`),
};

// ---------- Reference Data ----------
export const refApi = {
  customers: () => api.get("/customers"),
  products: () => api.get("/products"),
};

// ---------- Optional helper wrappers (safe calls) ----------
// Yeh helpers UI components me try/catch kam kar dete hain
export const safe = async (promiseFn) => {
  try {
    const res = await promiseFn();
    return { ok: true, data: res.data, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message, status: e.status || 0, data: e.data };
  }
};

// Example usage in component:
// const { ok, data, error } = await safe(() => soApi.create(payload));
