
-- contraseña para todos: password123
INSERT INTO users (id, name, username, email, password_hash, role, approval_status)
VALUES
    (1, 'manager1', 'manager1', 'juan@restaurant.com', '$2a$10$GKOvJHmSVH8Wn2j8Cx5RAOEa.hBEBYPceZGh4YLrxaZ79XsjoRH2C', 'RESTAURANT_MANAGER', 'APPROVED'),
    (2, 'customer1', 'customer1', 'customer1@clickmunch.com', '$2a$10$GKOvJHmSVH8Wn2j8Cx5RAOEa.hBEBYPceZGh4YLrxaZ79XsjoRH2C', 'CUSTOMER', 'APPROVED'),
    (3, 'waiter1', 'waiter1', 'waiter1@restaurant.com', '$2a$10$GKOvJHmSVH8Wn2j8Cx5RAOEa.hBEBYPceZGh4YLrxaZ79XsjoRH2C', 'WAITER', 'APPROVED'),
    (4, 'chef1', 'chef1', 'chef1@restaurant.com', '$2a$10$GKOvJHmSVH8Wn2j8Cx5RAOEa.hBEBYPceZGh4YLrxaZ79XsjoRH2C', 'CHEF', 'APPROVED'),
    (5, 'admin1', 'admin1', 'admin1@clickmunch.com', '$2a$10$GKOvJHmSVH8Wn2j8Cx5RAOEa.hBEBYPceZGh4YLrxaZ79XsjoRH2C', 'ADMIN', 'APPROVED')
ON CONFLICT DO NOTHING;

SELECT setval('users_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM users), 1));
