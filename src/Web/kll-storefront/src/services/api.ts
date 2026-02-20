import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kll_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("kll_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const productApi = {
  search: (params: Record<string, any>) => api.get("/api/v1/products/search", { params }).then((r) => r.data),
  getAll: () => api.get("/api/v1/products").then((r) => r.data),
  getById: (id: string) => api.get(`/api/v1/products/${id}`).then((r) => r.data),
  getByCategory: (catId: string) => api.get(`/api/v1/products/category/${catId}`).then((r) => r.data),
};

export const categoryApi = {
  getAll: () => api.get("/api/v1/categories").then((r) => r.data),
  getTree: () => api.get("/api/v1/categories/tree").then((r) => r.data),
};

export const cartApi = {
  get: () => api.get("/api/v1/cart").then((r) => r.data),
  addItem: (productId: string, quantity = 1) => api.post("/api/v1/cart/items", { productId, quantity }).then((r) => r.data),
  updateItem: (productId: string, quantity: number) => api.put(`/api/v1/cart/items/${productId}`, { quantity }).then((r) => r.data),
  removeItem: (productId: string) => api.delete(`/api/v1/cart/items/${productId}`),
  clear: () => api.delete("/api/v1/cart"),
};

export const orderApi = {
  create: (data: any) => api.post("/api/v1/orders", data).then((r) => r.data),
  getById: (id: string) => api.get(`/api/v1/orders/${id}`).then((r) => r.data),
  getMine: () => api.get("/api/v1/orders/mine").then((r) => r.data),
  getOrderTracking: (orderId: string) => api.get(`/api/v1/shipments/order/${orderId}`).then((r) => r.data),
  confirmPayment: (id: string, chargeId: string) => api.post(`/api/v1/orders/${id}/confirm-payment`, { chargeId }).then((r) => r.data),
};

export const shippingApi = {
  calculate: (cep: string, cartTotal: number) =>
    api.get("/api/v1/shipping/calculate", { params: { cep, cartTotal } }).then((r) => r.data),
};

export const profileApi = {
  get: () => api.get("/api/v1/profile").then((r) => r.data),
  update: (data: { firstName: string; lastName: string }) => api.put("/api/v1/profile", data).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/v1/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};

export const addressApi = {
  getAll: () => api.get("/api/v1/addresses").then((r) => r.data),
  getById: (id: string) => api.get(`/api/v1/addresses/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/api/v1/addresses", data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/api/v1/addresses/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/api/v1/addresses/${id}`),
  setDefault: (id: string) => api.put(`/api/v1/addresses/${id}/default`).then((r) => r.data),
};

export const favoriteApi = {
  getAll: () => api.get("/api/v1/favorites").then((r) => r.data),
  getIds: () => api.get("/api/v1/favorites/ids").then((r) => r.data),
  add: (productId: string) => api.post(`/api/v1/favorites/${productId}`).then((r) => r.data),
  remove: (productId: string) => api.delete(`/api/v1/favorites/${productId}`),
  check: (productId: string) => api.get(`/api/v1/favorites/${productId}/check`).then((r) => r.data),
};

export const paymentApi = {
  healthCheck: () => api.get("/api/v1/pay/health/krt").then((r) => r.data),
  // PIX
  createPixCharge: (data: { orderId: string; amount: number; description?: string; payerCpf?: string }) =>
    api.post("/api/v1/pay/pix/charge", data).then((r) => r.data),
  getPixChargeStatus: (chargeId: string) =>
    api.get(`/api/v1/pay/pix/${chargeId}/status`).then((r) => r.data),
  // Boleto
  createBoletoCharge: (data: { orderId: string; amount: number; description?: string; payerCpf?: string; payerName?: string; dueDate?: string }) =>
    api.post("/api/v1/pay/boleto/charge", data).then((r) => r.data),
  getBoletoChargeStatus: (chargeId: string) =>
    api.get(`/api/v1/pay/boleto/${chargeId}/status`).then((r) => r.data),
  // Card
  createCardCharge: (data: { amount: number; orderId?: string; description?: string; installments?: number; cardId?: string }) =>
    api.post("/api/v1/pay/card/charge", data).then((r) => r.data),
  getCardChargeStatus: (chargeId: string) =>
    api.get(`/api/v1/pay/card/${chargeId}/status`).then((r) => r.data),
};

// Backwards compat alias
export const pixApi = {
  healthCheck: () => paymentApi.healthCheck(),
  createCharge: (data: { orderId: string; amount: number; description?: string; payerCpf?: string }) =>
    paymentApi.createPixCharge(data),
  getChargeStatus: (chargeId: string) =>
    paymentApi.getPixChargeStatus(chargeId),
};

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post("/api/v1/auth/login", { identifier, password }).then((r) => r.data),
  register: (data: { email: string; password: string; firstName: string; lastName: string; cpf?: string }) =>
    api.post("/api/v1/auth/register", { username: data.email, ...data }).then((r) => r.data),
};

export default api;
