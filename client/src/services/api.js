import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getProducts = () => api.get('/products');
export const getCostItems = () => api.get('/cost-items');
export const getCalculations = () => api.get('/calculations');
export const createCalculation = (data) => api.post('/calculations', data);

export default api;
