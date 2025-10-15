import { api } from "./axios";

const companyAPI = {
  create: (payload) => api.post("/companies", payload),
  getAll: () => api.get("/companies"),
};

export default companyAPI;
