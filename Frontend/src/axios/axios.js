import axios from "axios";
import authUtil from "../utils/auth";

// Base URL: .env me VITE_API_BASE_URL set karo, e.g.
// VITE_API_BASE_URL=http://localhost:5000/api
const baseURL =
  import.meta.env?.VITE_API_BASE_URL ||
  process.env?.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  // timeout: 15000, // optional
});

// Request interceptor: inject x-company-code
api.interceptors.request.use(
  (config) => {
    try {
      const code = localStorage.getItem("company_code");
      if (code) {
        config.headers["x-company-code"] = String(code).toLowerCase();
      }
      // attach Authorization from cookie-backed auth util on every request
      try {
        const t = authUtil.getAuthToken();
        if (t) config.headers['Authorization'] = `Bearer ${t}`;
      } catch {}
    } catch {
      // localStorage may be unavailable in some environments; ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for error toasts/logging
// api.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     // Example: global toast/error handling
//     return Promise.reject(error);
//   }
// );

// Global 401 handler: if token expired/invalid, clear auth and redirect to login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        authUtil.clearAuth();
      } catch {}
      // redirect to login (replace to avoid back button going to protected route)
      try { window.location.replace('/login'); } catch {}
    }
    return Promise.reject(err);
  }
);
