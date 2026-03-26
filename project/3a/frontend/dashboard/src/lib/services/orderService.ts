import type { Order, OrderItem, CreateOrderDTO, UpdateOrderDTO, OrderStatus } from '@/lib/types';

// TODO: Conectar con el backend - OrderService (puerto 8083)
// URL base: http://localhost:8083/api/orders

let mockOrders: Order[] = [
  {
    id: 'ORD-9001',
    customer: 'Ana Ríos',
    customerId: 'CUST-001',
    restaurant: 'Urban Bistro',
    restaurantId: 'REST-001',
    items: [
      { productId: 'PRD-001', productName: 'Latte Vainilla', quantity: 2, unitPrice: 4.50, subtotal: 9.00 },
      { productId: 'PRD-003', productName: 'Burger Doble', quantity: 3, unitPrice: 12.00, subtotal: 36.00 },
    ],
    eta: '12 min',
    status: 'Preparing',
    total: 48.20,
    notes: 'Sin cebolla en la hamburguesa',
    createdAt: '2025-10-21T12:05:00Z',
    updatedAt: '2025-10-21T12:05:00Z',
    channel: 'Reservation',
  },
  {
    id: 'ORD-9002',
    customer: 'Carlos Mendez',
    customerId: 'CUST-002',
    restaurant: 'Café Andino',
    restaurantId: 'REST-002',
    items: [
      { productId: 'PRD-002', productName: 'Ensalada Mediterránea', quantity: 2, unitPrice: 9.80, subtotal: 19.60 },
      { productId: 'PRD-001', productName: 'Latte Vainilla', quantity: 2, unitPrice: 4.50, subtotal: 9.00 },
    ],
    eta: 'Listo',
    status: 'Ready',
    total: 28.50,
    createdAt: '2025-10-21T12:10:00Z',
    updatedAt: '2025-10-21T12:15:00Z',
    channel: 'Reservation',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  async getAll(): Promise<Order[]> {
    await delay(300);
    return [...mockOrders];
  },

  async getById(id: string): Promise<Order | null> {
    await delay(200);
    return mockOrders.find(o => o.id === id) || null;
  },

  async create(data: CreateOrderDTO): Promise<Order> {
    await delay(500);
    const orderNumber = mockOrders.length + 9001;
    const items = data.items.map(item => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const newOrder: Order = {
      id: "ORD-${orderNumber}",
      customerId: data.customerId,
      customer: 'Cliente ' + data.customerId,
      restaurantId: data.restaurantId,
      restaurant: 'Restaurante ' + data.restaurantId,
      items,
      total,
      status: 'Preparing',
      eta: 'Calculando...',
      notes: data.notes,
      channel: data.channel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.push(newOrder);
    return newOrder;
  },

  async update(data: UpdateOrderDTO): Promise<Order | null> {
    await delay(500);
    const index = mockOrders.findIndex(o => o.id === data.id);
    if (index === -1) return null;
    
    mockOrders[index] = {
      ...mockOrders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockOrders[index];
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return this.update({ id, status });
  },

  async getByRestaurant(restaurantId: string): Promise<Order[]> {
    await delay(300);
    return mockOrders.filter(o => o.restaurantId === restaurantId);
  },

  async getByCustomer(customerId: string): Promise<Order[]> {
    await delay(300);
    return mockOrders.filter(o => o.customerId === customerId);
  },

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    await delay(300);
    return mockOrders.filter(o => o.status === status);
  },
};

