export interface ErrorResponse {
    code: string;
    message: string;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
    image?: string;
}

export interface OrderItem {
    menuItemId: number;
    quantity: number;
}

export interface OrderItemState extends OrderItem {
    productName: string;
    unitPrice: number;
}

export interface OrderPayload {
    restaurantId: number;
    customerName: string;
    customerPhone: string;
    notes?: string;
    items: OrderItem[];
}

export interface OrderResponseItem {
    productName: string;
    unitPrice: number;
    subtotal: number;
    quantity: number;
}

export interface OrderConfirmation {
    orderId: number;
    status: string; // initial value: CREATED
    totalAmount: number;
    items: OrderResponseItem[];
}

export interface OrderEvent {
    eventType: string; // UPPER_SNAKE_CASE
    timestamp: string; // ISO-8601 UTC
    details?: Record<string, any>;
    payload?: Record<string, any>;
}
