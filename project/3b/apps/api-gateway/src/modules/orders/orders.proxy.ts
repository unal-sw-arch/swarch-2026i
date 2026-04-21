import { OrdersClient } from '../../services/clients/orders.client';
import type {
  CreateOrderInput,
  GetOrderByIdInput,
  ListCustomerOrdersInput,
  ListRestaurantOrdersInput,
  ProxyResponse,
} from './orders.types';

export class OrdersProxy {
  constructor(private readonly client: OrdersClient = new OrdersClient()) {}

  public async createOrder(input: CreateOrderInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'POST',
      path: '/orders',
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async getOrderById(input: GetOrderByIdInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: `/orders/${input.id}`,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async getCustomerOrders(input: ListCustomerOrdersInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: '/customers/me/orders',
      query: input.query,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async getRestaurantOrders(input: ListRestaurantOrdersInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: '/restaurants/me/orders',
      query: input.query,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }
}
