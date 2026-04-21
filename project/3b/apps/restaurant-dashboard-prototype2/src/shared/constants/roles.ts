export const ROLES = {
  RESTAURANT: "restaurant",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
