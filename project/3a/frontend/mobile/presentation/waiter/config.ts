// Centralized access to waiter-app configuration. Kept as a single file so
// tests and screens don't sprinkle `process.env` reads everywhere.

const DEFAULT_RESTAURANT_ID = 1;

export const getWaiterRestaurantId = (): number => {
    const raw = process.env.EXPO_PUBLIC_WAITER_RESTAURANT_ID;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RESTAURANT_ID;
};
