import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/core/orders/actions/get-order-by-id.action';

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });
};
