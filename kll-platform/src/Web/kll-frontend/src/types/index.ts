export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  trackingCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

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
  pixQrCode: string | null;
  bankChargeId: string | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  recipientName: string;
  trackingCode: string;
  status: string;
  destinationCity: string;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  trackingEvents: TrackingEvent[];
}

export interface TrackingEvent {
  description: string;
  location: string;
  timestamp: string;
}

export interface CreateOrderRequest {
  customerId: string;
  customerEmail: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  items: { productId: string; quantity: number }[];
}