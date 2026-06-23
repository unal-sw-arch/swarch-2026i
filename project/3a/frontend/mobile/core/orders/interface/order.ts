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
    customerId?: number | null;
    customerName?: string | null;
    tableNumber: number;
    status: OrderStatus;
    notes: string | null;
    totalAmount: number;
    priority: number;
    requestedArrivalTime?: string | null;
    arrivalMessage?: string | null;
    cancellationReason?: string | null;
    cancelledAt?: string | null;
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
    customerId?: number | null;
    customerName?: string | null;
    totalAmount?: number | null;
    notes?: string | null;
    items: CreateOrderItemInput[];
}

export type EtaMode = 'WALKING' | 'DRIVING';

export interface OrderEta {
    orderId: number;
    restaurantId: number;
    mode: EtaMode;
    etaMinutes: number | null;
}

export type KitchenEventType = 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';

export interface KitchenEvent {
    type: KitchenEventType;
    order: Order;
    timestamp: string;
}
