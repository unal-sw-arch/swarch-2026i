import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '@/core/orders/actions/get-orders.action';

export const useOrders = (customerId: number) => {
  return useQuery({
    queryKey: ['orders', customerId],
    queryFn: () => getOrdersByCustomer(customerId),
    staleTime: 1000 * 60 * 2,
    enabled: !!customerId,
  });
};
