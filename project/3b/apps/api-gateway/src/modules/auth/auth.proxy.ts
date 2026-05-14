import { AuthClient } from '../../services/clients/auth.client';
import type {
  LoginCustomerInput,
  LoginRestaurantInput,
  MeInput,
  ProxyResponse,
  RegisterCustomerInput,
} from './auth.types';

export class AuthProxy {
  constructor(private readonly client: AuthClient = new AuthClient()) {}

  public async registerCustomer(input: RegisterCustomerInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'POST',
      path: '/auth/register/customer',
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async loginCustomer(input: LoginCustomerInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'POST',
      path: '/auth/login/customer',
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async loginRestaurant(input: LoginRestaurantInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'POST',
      path: '/auth/login/restaurant',
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }

  public async me(input: MeInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'GET',
      path: '/auth/me',
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }
}
