import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

export const getProducts = () => api.get('/products');
export const getCostItems = () => api.get('/cost-items');
export const getCalculations = () => api.get('/history');
export const createCalculation = (data) => api.post('/history', data);

export default api;
