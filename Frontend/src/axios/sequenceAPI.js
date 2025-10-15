import { api } from './axios';
const sequenceAPI = {
  next: (name, params = {}) => api.get(`/sequences/next/${encodeURIComponent(name)}`, { params }),
};
export default sequenceAPI;
