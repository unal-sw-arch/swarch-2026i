INSERT INTO restaurants (id, owner_id, name, description, phone, email, location_id)
VALUES (1026, 1, 'Juan''s Restaurant', 'Restaurante de Juan', '+57-300-111-2222', 'juan@restaurant.com', 1011)
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurant_profiles (id, restaurant_id, category, city, avg_price, delivery_time, badge, rating, latitude, longitude)
VALUES (1026, 1026, 'General', 'Bogota', '$ 3.000', '30 min', '', 0, 4.648283, -74.107807)
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurant_admins (restaurant_id, user_id)
VALUES (1026, 1)
ON CONFLICT (restaurant_id, user_id) DO NOTHING;

INSERT INTO staff_assignments (id, restaurant_id, user_id, role)
VALUES
    (10001, 1026, 3, 'WAITER'),
    (10002, 1026, 4, 'CHEF')
ON CONFLICT (id) DO NOTHING;

SELECT setval('restaurants_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM restaurants), 1));
SELECT setval('staff_assignments_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM staff_assignments), 1));
