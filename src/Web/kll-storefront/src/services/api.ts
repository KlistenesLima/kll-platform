import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

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
};

export const authApi = {
  login: (username: string, password: string) =>
    axios.post(
      `${import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8081"}/realms/kll-platform/protocol/openid-connect/token`,
      new URLSearchParams({ grant_type: "password", client_id: "kll-storefront", username, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ).then((r) => r.data),
  register: (username: string, email: string, password: string, firstName: string, lastName: string) =>
    api.post("/api/v1/auth/register", { username, email, password, firstName, lastName }).then((r) => r.data),
};

export default api;
