import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://money-manager-mauve-seven.vercel.app/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  getSummary: (view) => api.get(`/transactions/summary/${view}`),
  getCategorySummary: () => api.get('/transactions/summary/category')
};

export const accountAPI = {
  getAll: () => api.get('/transactions/accounts'),
  create: (data) => api.post('/transactions/accounts', data)
};

export default api;
