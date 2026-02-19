import axios from 'axios';
import type { Product, Order, Merchant, Transaction, Shipment, Category } from '../types';

const GATEWAY = import.meta.env.VITE_API_URL || 'http://localhost:5100';
const api = axios.create({ baseURL: GATEWAY, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kll_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kll_admin_token');
      window.location.reload();
    }
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
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
  updateProduct: (id: string, data: Partial<Product>) =>
    api.put(`/api/v1/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: string) =>
    api.delete(`/api/v1/products/${id}`),
  getAllOrders: () =>
    api.get<Order[]>('/api/v1/orders').then(r => r.data),
  getOrder: (id: string) =>
    api.get<Order>(`/api/v1/orders/${id}`).then(r => r.data),
  getOrdersByCustomer: (customerId: string) =>
    api.get<Order[]>(`/api/v1/orders/customer/${customerId}`).then(r => r.data),
  createOrder: (data: any) =>
    api.post<{ id: string }>('/api/v1/orders', data).then(r => r.data),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/api/v1/orders/${id}/status`, { status }),
  cancelOrder: (id: string, reason?: string) =>
    api.post(`/api/v1/orders/${id}/cancel`, { reason }),
};
export const categoryApi = {
  getAll: (activeOnly = false) =>
    api.get<Category[]>('/api/v1/categories', { params: { activeOnly } }).then(r => r.data),
  getById: (id: string) =>
    api.get<Category>(`/api/v1/categories/${id}`).then(r => r.data),
  create: (data: { name: string; description?: string; imageUrl?: string; parentCategoryId?: string }) =>
    api.post<{ id: string; name: string; slug: string }>('/api/v1/categories', data).then(r => r.data),
  update: (id: string, data: { name: string; description?: string; imageUrl?: string; displayOrder: number }) =>
    api.put(`/api/v1/categories/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/api/v1/categories/${id}`),
};
export const payApi = {
  getMerchants: () =>
    api.get<Merchant[]>('/api/v1/merchants').then(r => r.data),
  createMerchant: (data: { name: string; document: string; email: string; webhookUrl?: string }) =>
    api.post<Merchant>('/api/v1/merchants', data).then(r => r.data),
  getAllTransactions: () =>
    api.get<Transaction[]>('/api/v1/transactions').then(r => r.data),
  getTransactions: (merchantId: string) =>
    api.get<Transaction[]>(`/api/v1/transactions/merchant/${merchantId}`).then(r => r.data),
  createCharge: (data: any) =>
    api.post<Transaction>('/api/v1/transactions/charge', data).then(r => r.data),
};
export const logisticsApi = {
  getAllShipments: () =>
    api.get<Shipment[]>('/api/v1/shipments').then(r => r.data),
  getShipment: (id: string) =>
    api.get<Shipment>(`/api/v1/shipments/${id}`).then(r => r.data),
  getShipmentByOrder: (orderId: string) =>
    api.get<Shipment>(`/api/v1/shipments/order/${orderId}`).then(r => r.data),
  trackShipment: (code: string) =>
    api.get<Shipment>(`/api/v1/shipments/track/${code}`).then(r => r.data),
  updateShipmentStatus: (id: string, data: { status: number; description: string; location?: string }) =>
    api.put(`/api/v1/shipments/${id}/status`, data),
};
export const dashboardApi = {
  getStats: () => api.get('/api/v1/dashboard/stats').then(r => r.data),
};
export const healthApi = {
  getAll: () => api.get<Record<string, string>>('/health/all').then(r => r.data),
};
export const systemApi = {
  getStatus: () => api.get('/api/v1/system/status').then(r => r.data),
};
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }).then(r => r.data);
  },
};
