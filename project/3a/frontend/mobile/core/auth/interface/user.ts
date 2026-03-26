export type Role =
	| 'CUSTOMER'
	| 'RESTAURANT_MANAGER'
	| 'WAITER'
	| 'CHEF'
	| 'ADMIN';

export interface User {
	id?: number;
	name?: string;
	email?: string;
	username?: string;
	role?: Role;
	createdAt?: string; // ISO date string from backend
	resetToken?: string | null;
	resetTokenExpiry?: string | null; // ISO date string or null
}

export default User;

