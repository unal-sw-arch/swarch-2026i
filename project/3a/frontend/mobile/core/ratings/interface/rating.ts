export interface Rating {
  id: number;
  customerId: number;
  restaurantId: number;
  score: number;
  review?: string;
  createdAt?: string;
}

export interface CreateRatingRequest {
  customerId: number;
  restaurantId: number;
  score: number;
  review?: string;
}
