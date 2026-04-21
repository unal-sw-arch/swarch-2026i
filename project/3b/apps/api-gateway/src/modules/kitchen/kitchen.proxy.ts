import { KitchenClient } from '../../services/clients/kitchen.client';
import type {
  KitchenOrdersInput,
  ProxyResponse,
  UpdateKitchenOrderStatusInput,
} from './kitchen.types';

export class KitchenProxy {
  constructor(private readonly client: KitchenClient = new KitchenClient()) {}

  public async kitchenOrders(input: KitchenOrdersInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: '/kitchen/orders',
      query: input.query,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async updateOrderStatus(input: UpdateKitchenOrderStatusInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'PATCH',
      path: `/kitchen/orders/${input.orderId}/status`,
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }
}
