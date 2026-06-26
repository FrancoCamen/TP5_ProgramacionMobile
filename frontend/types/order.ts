export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id?: number;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAttributes {
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}
