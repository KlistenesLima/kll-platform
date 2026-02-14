import axios from 'axios';
import type { Product, Order, CreateOrderRequest, Shipment, Transaction, Merchant } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// Store
export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  search: (q: string) => api.get<Product[]>(`/products/search?q=${q}`),
};

export const orderApi = {
  create: (data: CreateOrderRequest) => api.post<Order>('/orders', data),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  getByCustomer: (customerId: string) => api.get<Order[]>(`/orders/customer/${customerId}`),
};

// Pay
export const merchantApi = {
  getAll: () => api.get<Merchant[]>('/merchants'),
  create: (data: { name: string; document: string; email: string; webhookUrl?: string }) =>
    api.post<Merchant>('/merchants', data),
};

export const transactionApi = {
  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),
  getByMerchant: (merchantId: string) => api.get<Transaction[]>(`/transactions/merchant/${merchantId}`),
  createCharge: (data: { apiKey: string; amount: number; type: string; description?: string }) =>
    api.post<Transaction>('/transactions/charge', data),
};

// Logistics
export const shipmentApi = {
  getById: (id: string) => api.get<Shipment>(`/shipments/${id}`),
  track: (code: string) => api.get<Shipment>(`/shipments/track/${code}`),
};

export default api;