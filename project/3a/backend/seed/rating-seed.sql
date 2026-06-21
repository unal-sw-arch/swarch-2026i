-- Reviews for Juan's Restaurant (id 1026). Drives the dashboard rating card
-- (GET /rating/restaurant/1026/summary -> averageScore, totalRatings) and the
-- ratings page feed. order_id references the delivered orders in order-seed.sql.
-- customer_id / customer_name are denormalized here (RatingService has its own
-- DB and does not FK into AuthService), so the names can vary for a realistic feed.

INSERT INTO restaurant_ratings (id, customer_id, customer_name, restaurant_id, restaurant_name, order_id, score, review, created_at)
VALUES
    (7001, 2,  'customer1',      1026, 'Juan''s Restaurant', 5001, 5, 'Excelente comida y atención, la hamburguesa estaba deliciosa.', date_trunc('month', CURRENT_DATE) + INTERVAL '1 day'),
    (7002, 2,  'customer1',      1026, 'Juan''s Restaurant', 5002, 4, 'Muy rico todo, aunque demoró un poco el pedido.',              date_trunc('month', CURRENT_DATE) + INTERVAL '2 day'),
    (7003, 21, 'Laura Gómez',    1026, 'Juan''s Restaurant', 5003, 5, 'Mi restaurante favorito, la malteada es espectacular.',        date_trunc('month', CURRENT_DATE) + INTERVAL '3 day'),
    (7004, 22, 'Andrés Pérez',   1026, 'Juan''s Restaurant', 5004, 3, 'Buena comida pero el local estaba algo lleno.',                date_trunc('month', CURRENT_DATE) + INTERVAL '4 day'),
    (7005, 23, 'María Rodríguez',1026, 'Juan''s Restaurant', 5005, 5, 'Porciones generosas y excelente sabor. Volveré.',              date_trunc('month', CURRENT_DATE) + INTERVAL '5 day'),
    (7006, 24, 'Carlos Díaz',    1026, 'Juan''s Restaurant', 5006, 4, 'El sándwich de pollo es muy bueno, recomendado.',              date_trunc('month', CURRENT_DATE) + INTERVAL '6 day')
ON CONFLICT (id) DO NOTHING;

-- A couple of waiter ratings for waiter1 (user id 3) at the same restaurant.
INSERT INTO waiter_ratings (id, customer_id, customer_name, waiter_id, waiter_name, restaurant_id, order_id, score, comment, created_at)
VALUES
    (8001, 2,  'customer1',   3, 'waiter1', 1026, 5001, 5, 'Muy amable y atento.',         date_trunc('month', CURRENT_DATE) + INTERVAL '1 day'),
    (8002, 23, 'María Rodríguez', 3, 'waiter1', 1026, 5005, 4, 'Buen servicio en la mesa.', date_trunc('month', CURRENT_DATE) + INTERVAL '5 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval('restaurant_ratings_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM restaurant_ratings), 1));
SELECT setval('waiter_ratings_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM waiter_ratings), 1));
