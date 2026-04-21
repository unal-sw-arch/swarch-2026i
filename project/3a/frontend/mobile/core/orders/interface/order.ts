export type OrderStatus =
    | 'PENDING'
    | 'IN_PREPARATION'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELLED';

// One ordered unit. Two burgers with different instructions come as two
// entries with different `notes`. The waiter UI groups visually by
// (itemName, notes) when rendering existing orders.
export interface OrderItem {
    id: number;
    itemName: string;
    notes: string | null;
}

export interface Order {
    id: number;
    restaurantId: number;
    tableNumber: number;
    status: OrderStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export interface CreateOrderItemInput {
    itemName: string;
    notes?: string | null;
}

export interface CreateOrderInput {
    restaurantId: number;
    tableNumber: number;
    notes?: string | null;
    items: CreateOrderItemInput[];
}

export type KitchenEventType = 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';

export interface KitchenEvent {
    type: KitchenEventType;
    order: Order;
    timestamp: string;
}
