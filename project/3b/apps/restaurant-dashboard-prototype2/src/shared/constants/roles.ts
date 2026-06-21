export const ROLES = {
  RESTAURANT: "RESTAURANT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
