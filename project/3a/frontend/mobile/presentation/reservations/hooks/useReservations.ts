import { useQuery } from '@tanstack/react-query';
import { getReservationsByCustomer } from '@/core/reservations/actions/get-reservations.action';

export const useReservations = (customerId: number) => {
  return useQuery({
    queryKey: ['reservations', customerId],
    queryFn: () => getReservationsByCustomer(customerId),
    staleTime: 1000 * 60 * 5,
    enabled: !!customerId,
  });
};
