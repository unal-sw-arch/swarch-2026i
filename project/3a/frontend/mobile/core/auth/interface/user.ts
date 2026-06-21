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
	phone?: string | null;
	bio?: string | null;
	profileImageUrl?: string | null;
	address?: string | null;
	governmentId?: string | null;
	telegramChatId?: string | null;
	createdAt?: string; // ISO date string from backend
	resetToken?: string | null;
	resetTokenExpiry?: string | null; // ISO date string or null
}

export default User;

