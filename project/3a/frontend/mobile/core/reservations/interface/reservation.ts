export type ReservationStatus =
  | 'Pendiente'
  | 'Confirmada'
  | 'Cancelada'
  | 'Completada';

export interface Reservation {
  id: number;
  customerId: number;
  restaurantId: number;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: ReservationStatus;
  notes?: string;
  orderId?: number;
  createdAt?: string;
}

export interface CreateReservationRequest {
  customerId: number;
  restaurantId: number;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  notes?: string;
}
