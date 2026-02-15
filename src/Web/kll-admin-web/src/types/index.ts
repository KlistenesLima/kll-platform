// Store
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
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

// Logistics
export interface TrackingEvent {
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
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
}
