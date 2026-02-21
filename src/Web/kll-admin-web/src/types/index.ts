// Store
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  categoryId?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  trackingCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string;
  isActive: boolean;
  displayOrder: number;
  subCategories?: Category[];
}

// Pay
export interface Merchant {
  id: string;
  name: string;
  document: string;
  email: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  status: string;
  type: string;
  pixQrCode?: string;
  bankChargeId?: string;
  createdAt: string;
}

// Users
export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  document: string;
  role: 'Cliente' | 'Tecnico' | 'Administrador';
  status: 'PendingEmailConfirmation' | 'PendingApproval' | 'Active' | 'Inactive' | 'Rejected';
  createdAt: string;
  approvedAt?: string;
}

// Logistics
export interface TrackingEvent {
  id?: string;
  description: string;
  location: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  recipientName: string;
  trackingCode: string;
  status: string;
  destinationCity: string;
  destinationState?: string;
  destinationAddress?: string;
  destinationZipCode?: string;
  weight?: number;
  driverId?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
}
