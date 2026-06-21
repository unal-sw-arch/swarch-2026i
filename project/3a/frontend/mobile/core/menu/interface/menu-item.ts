export interface MenuItem {
    id: number;
    name: string;
    description?: string | null;
    price?: number | null;
    categoryId?: number | null;
    restaurantId?: number | null;
    available?: boolean;
}
