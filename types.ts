
export enum Category {
  COMPONENTS = 'Componentes',
  PERIPHERALS = 'Periféricos',
  LAPTOPS = 'Laptops',
  STORAGE = 'Almacenamiento',
  NETWORK = 'Redes',
}

export interface Product {
  id: string;
  name: string;
  price: number; // Selling Price in USD
  costPrice: number; // Cost Price in USD
  category: Category;
  description: string;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export type OrderStatus = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';

export interface Order {
  id: string;
  date: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  totalUsd: number;
  exchangeRateSnapshot: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type ViewState = 'STORE' | 'ADMIN';
