import axios from 'axios';

// In dev, Vite proxy handles /api and /webhook routes
// In production, set VITE_API_URL to your backend URL
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s timeout for Gemini processing
});

// Analytics
export const getAnalyticsSummary = () => api.get('/api/analytics/summary');

// Bills
export const getBills = (params = {}) => api.get('/api/bills', { params });
export const getBill = (id) => api.get(`/api/bills/${id}`);
export const updateBill = (id, data) => api.put(`/api/bills/${id}`, data);
export const verifyBill = (id, data) => api.put(`/api/bills/${id}/verify`, data);

// Upload
export const uploadImage = (formData) =>
  api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;
