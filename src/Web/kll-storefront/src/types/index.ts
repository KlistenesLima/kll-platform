export interface Product {
  id: string; name: string; description: string; price: number;
  stockQuantity: number; category: string; categoryId?: string;
  imageUrl?: string; isActive: boolean; createdAt: string;
}
export interface Category {
  id: string; name: string; slug: string; description?: string;
  imageUrl?: string; isActive: boolean; displayOrder: number;
  subCategories?: Category[];
}
export interface CartItem {
  productId: string; productName: string; unitPrice: number;
  quantity: number; total: number; imageUrl?: string;
}
export interface Cart { id: string; items: CartItem[]; total: number; itemCount: number; }
export interface Order {
  id: string; customerId: string; status: string; totalAmount: number;
  createdAt: string; items: OrderItem[];
}
export interface OrderItem { productId: string; productName: string; quantity: number; unitPrice: number; }
export interface PagedResult<T> { items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number; }
export interface User { sub: string; preferred_username: string; email: string; realm_roles: string[]; }
