export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export interface CustomerSession {
  userId: number;
  role: "CUSTOMER";
  name: string;
  email: string;
  restaurantId: null;
}

export interface Restaurant {
  id: number;
  name: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface RestaurantMenu {
  restaurantId: number;
  menuId: number;
  items: MenuItem[];
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
}

export interface Recommendation {
  menuItemId: number;
  reason: string;
}

export interface OrderCreateItem {
  menuItemId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  restaurantId: number;
  notes: string;
  items: OrderCreateItem[];
}

export interface OrderItemDetail {
  menuItemId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDetail {
  id: number;
  customerId: number;
  restaurantId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItemDetail[];
}

export interface OrderSummary {
  id: number;
  restaurantId: number;
  status: OrderStatus;
  totalAmount: number;
}

export type OrderStatus =
  | "CREATED"
  | "IN_PREPARATION"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type TimelineEventType =
  | "ORDER_CREATED"
  | "ORDER_STATUS_CHANGED"
  | "ORDER_READY";

export interface TimelineEvent {
  eventType: TimelineEventType | string;
  timestamp: string;
  payload?: Record<string, string | number | boolean | null>;
}

export interface TimelineResponse {
  orderId: number | string;
  events: TimelineEvent[];
}

export interface RestaurantsResponse {
  items: Restaurant[];
}

export interface PromotionsResponse {
  items: Promotion[];
}

export interface RecommendationsResponse {
  items: Recommendation[];
}

export interface OrdersResponse {
  items: OrderSummary[];
}

export interface LoginCustomerRequest {
  email: string;
  password: string;
}

export interface RegisterCustomerRequest extends LoginCustomerRequest {
  name: string;
}

export interface LoginCustomerResponse {
  accessToken: string;
  role: "CUSTOMER";
  userId: number;
}
