// Tipos para Productos
export type ProductStatus = 'Borrador' | 'Pendiente' | 'Publicado';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  image: string;
  createdAt: string;
  updatedAt: string;
  availableFrom: string;
  availableTo: string;
  preparationMinutes?: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  availableFrom: string;
  availableTo: string;
  preparationMinutes?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
  status?: ProductStatus;
}

// =======================
// ÓRDENES
// =======================

export type OrderChannel = 'Reservation' | 'In-person';

export interface CreateOrderDTO {
  customerId: string;
  restaurantId: string;
  items: Omit<OrderItem, 'subtotal'>[];
  channel: OrderChannel;
  notes?: string;
}

export interface UpdateOrderDTO {
  id: string;
  status?: OrderStatus;
  eta?: string;
  notes?: string;
}

// =======================
// RESTAURANTE
// =======================

export interface RestaurantMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNumber?: number;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  price: string;
  badge?: string;
  freeShipping?: boolean;
  category?: string;
  city?: string;
  status?: 'Activo' | 'Inactivo';
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

// =======================
// CATEGORÍAS
// =======================

export const PRODUCT_CATEGORIES = [
  'Entrada',
  'Bebidas',
  'Ensaladas',
  'Platos fuertes',
  'Postres',
  'Aperitivos',
  'Sopas',
  'Carnes',
  'Pescados',
  'Vegetariano',
  'Vegano',
  'Adicional'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// =======================
// MESAS Y HORARIOS
// =======================

export interface Table {
  id: number;
  restaurantId: number;
  tableNumber: string;
  seats: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

export interface TableApiResponse {
  id: number;
  restaurantId: number;
  tableNumber: string;
  seats: number;
  status: string;
}

export interface OperatingHours {
  id?: number;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

// =======================
// MENÚ BACKEND
// =======================

export interface BackendMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  availableFrom: string;
  availableTo: string;
  isAvailable: boolean;
  preparationMinutes?: string;
}

export interface BackendMenuCategory {
  id: string;
  restaurantId: number;
  category: "ENTRADA" | "PLATO_FUERTE" | "SOPA" | "POSTRE" | "BEBIDA" | "ENSALADA" | "APERITIVO" | "CARNE" | "PESCADO" | "VEGETARIANO" | "VEGANO" | "ADICIONAL";
}

export interface MenuRestaurantResponse {
  restaurantId: number;
  categories: {
    id: string;
    name: string;
    restaurantId: number;
    items: BackendMenuItem[];
  }[];
}

export interface MenuCategoryRequest {
  restaurantId: number;
  category: string;
}

export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  availableFrom: string;
  availableTo: string;
  isAvailable: boolean;
  preparationMinutes?: number;
}

// =======================
// RATINGS
// =======================

export interface RatingSummary {
  entityId: number;
  averageScore: number;
  totalRatings: number;
}

export interface IndividualRating {
  id: number;
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  orderId: number;
  score: number;
  review: string;
  createdAt: string;
}

// =======================
// ÓRDENES DETALLE
// =======================

export type OrderStatus =
  | "PENDING"
  | "IN_PREPARATION"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  id: number;
  menuItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: number;
  customerId: number | null;
  customerName: string | null;
  restaurantId: number;
  restaurantName?: string;
  status: OrderStatus;
  notes: string | null;
  eta?: string;
  total: number;
  totalAmount: number;
  priority: number;
  tableNumber: number;
  tableId: number | null;
  waiterId: number | null;
  tipAmount: number | null;
  waiterComment: string | null;
  preparationMinutes?: number;
  requestedArrivalTime?: string | null;
  arrivalMessage?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

// =======================
// 🍳 KITCHEN (MAIN)
// =======================

export type KitchenOrderStatus =
  | 'PENDING'
  | 'IN_PREPARATION'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface KitchenOrderItem {
  id: number;
  itemName: string;
  notes: string | null;
}

export interface KitchenOrder {
  id: number;
  restaurantId: number;
  tableNumber: number;
  status: KitchenOrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: KitchenOrderItem[];
}