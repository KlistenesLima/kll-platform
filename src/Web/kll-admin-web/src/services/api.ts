import axios from 'axios';
import type { Product, Order, Merchant, Transaction, Shipment } from '../types';
const GATEWAY = import.meta.env.VITE_API_URL || 'http://localhost:5100';
const api = axios.create({ baseURL: GATEWAY, timeout: 10000 });
api.interceptors.response.use(
  (r) => r,
  (err) => { console.error('API Error:', err.response?.data || err.message); return Promise.reject(err); }
);
export const storeApi = {
  getProducts: (category?: string) =>
    api.get<Product[]>('/api/v1/products', { params: { category } }).then(r => r.data),
  getProduct: (id: string) =>
    api.get<Product>(`/api/v1/products/${id}`).then(r => r.data),
  searchProducts: (q: string) =>
    api.get<Product[]>('/api/v1/products/search', { params: { q } }).then(r => r.data),
  createProduct: (data: Partial<Product>) =>
    api.post<{ id: string }>('/api/v1/products', data).then(r => r.data),
  getOrder: (id: string) =>
    api.get<Order>(`/api/v1/orders/${id}`).then(r => r.data),
  getOrdersByCustomer: (customerId: string) =>
    api.get<Order[]>(`/api/v1/orders/customer/${customerId}`).then(r => r.data),
  createOrder: (data: any) =>
    api.post<{ id: string }>('/api/v1/orders', data).then(r => r.data),
};
export const payApi = {
  getMerchants: () =>
    api.get<Merchant[]>('/api/v1/merchants').then(r => r.data),
  createMerchant: (data: { name: string; document: string; email: string; webhookUrl?: string }) =>
    api.post<Merchant>('/api/v1/merchants', data).then(r => r.data),
  getTransactions: (merchantId: string) =>
    api.get<Transaction[]>(`/api/v1/transactions/merchant/${merchantId}`).then(r => r.data),
  createCharge: (data: any) =>
    api.post<Transaction>('/api/v1/transactions/charge', data).then(r => r.data),
};
export const logisticsApi = {
  getShipment: (id: string) =>
    api.get<Shipment>(`/api/v1/shipments/${id}`).then(r => r.data),
  trackShipment: (code: string) =>
    api.get<Shipment>(`/api/v1/shipments/track/${code}`).then(r => r.data),
};
export const healthApi = {
  getAll: () => api.get<Record<string, string>>('/health/all').then(r => r.data),
};