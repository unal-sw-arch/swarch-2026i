import { TimelineClient } from '../../services/clients/timeline.client';
import type { GetOrderTimelineInput, ProxyResponse } from './timeline.types';

export class TimelineProxy {
  constructor(private readonly client: TimelineClient = new TimelineClient()) {}

  public async orderTimeline(input: GetOrderTimelineInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: `/orders/${input.orderId}/timeline`,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }
}
