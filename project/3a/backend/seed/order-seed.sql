-- Delivered orders for Juan's Restaurant (id 1026), customer1 (id 2).
-- created_at is anchored to the current month so OrderService's monthly
-- earnings query (year/month of "today") picks them up for the dashboard.
--
-- item_name values reference real dishes from the menu seed
-- (seed/menu-seed.js): "Hamburguesa con Queso" (9.99),
-- "Sándwich de Pollo Crujiente" (8.49), "Malteada de Chocolate" (4.99).
-- total_amount is the sum of each order's item prices.
-- "Hamburguesa con Queso" is intentionally the most-frequent delivered item
-- so the dashboard "most delivered dish" card has a deterministic winner.

INSERT INTO orders (id, restaurant_id, customer_id, customer_name, table_number, status, notes, total_amount, priority, created_at, updated_at)
VALUES
    (5001, 1026, 2, 'customer1', 1, 'DELIVERED', NULL, 14.98, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '1 day', date_trunc('month', CURRENT_DATE) + INTERVAL '1 day'),
    (5002, 1026, 2, 'customer1', 2, 'DELIVERED', NULL, 18.48, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '2 day', date_trunc('month', CURRENT_DATE) + INTERVAL '2 day'),
    (5003, 1026, 2, 'customer1', 3, 'DELIVERED', NULL, 14.98, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '3 day', date_trunc('month', CURRENT_DATE) + INTERVAL '3 day'),
    (5004, 1026, 2, 'customer1', 4, 'DELIVERED', NULL,  9.99, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '4 day', date_trunc('month', CURRENT_DATE) + INTERVAL '4 day'),
    (5005, 1026, 2, 'customer1', 5, 'DELIVERED', NULL, 18.48, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '5 day', date_trunc('month', CURRENT_DATE) + INTERVAL '5 day'),
    (5006, 1026, 2, 'customer1', 6, 'DELIVERED', NULL, 13.48, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '6 day', date_trunc('month', CURRENT_DATE) + INTERVAL '6 day'),
    (5007, 1026, 2, 'customer1', 7, 'CANCELLED', 'Cliente no llegó', 9.99, 0, date_trunc('month', CURRENT_DATE) + INTERVAL '6 day', date_trunc('month', CURRENT_DATE) + INTERVAL '6 day')
ON CONFLICT (id) DO NOTHING;

-- Active kitchen queue (the chefs' domain): PENDING / IN_PREPARATION / READY.
-- Feeds the dashboard "Estado de Chefs (cocina)" chart and the kitchen view.
-- created_at is "now-ish" because these are in-progress orders.
INSERT INTO orders (id, restaurant_id, customer_id, customer_name, table_number, status, notes, total_amount, priority, created_at, updated_at)
VALUES
    (5101, 1026, 2, 'customer1',  8, 'PENDING',        NULL,                14.98, 0, CURRENT_TIMESTAMP - INTERVAL '4 minute',  CURRENT_TIMESTAMP - INTERVAL '4 minute'),
    (5102, 1026, 2, 'customer1',  9, 'PENDING',        'Para llevar',        8.49, 0, CURRENT_TIMESTAMP - INTERVAL '3 minute',  CURRENT_TIMESTAMP - INTERVAL '3 minute'),
    (5103, 1026, 2, 'customer1', 10, 'IN_PREPARATION', NULL,                23.47, 1, CURRENT_TIMESTAMP - INTERVAL '12 minute', CURRENT_TIMESTAMP - INTERVAL '6 minute'),
    (5104, 1026, 2, 'customer1', 11, 'IN_PREPARATION', 'Sin cebolla',        9.99, 0, CURRENT_TIMESTAMP - INTERVAL '10 minute', CURRENT_TIMESTAMP - INTERVAL '5 minute'),
    (5105, 1026, 2, 'customer1', 12, 'IN_PREPARATION', NULL,                13.48, 0, CURRENT_TIMESTAMP - INTERVAL '9 minute',  CURRENT_TIMESTAMP - INTERVAL '4 minute'),
    (5106, 1026, 2, 'customer1', 13, 'READY',          NULL,                18.48, 0, CURRENT_TIMESTAMP - INTERVAL '18 minute', CURRENT_TIMESTAMP - INTERVAL '1 minute')
ON CONFLICT (id) DO NOTHING;

-- Orders finished TODAY (delivered/cancelled) so the dashboard
-- "Estado de Órdenes (Hoy)" chart shows the Enviados/Cancelados states too.
-- created_at is earlier today (these also count toward this month's revenue).
INSERT INTO orders (id, restaurant_id, customer_id, customer_name, table_number, status, notes, total_amount, priority, created_at, updated_at)
VALUES
    (5201, 1026, 2, 'customer1', 14, 'DELIVERED', NULL,            14.98, 0, date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '9 hour',  date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '9 hour'),
    (5202, 1026, 2, 'customer1', 15, 'DELIVERED', NULL,             9.99, 0, date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '10 hour', date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '10 hour'),
    (5203, 1026, 2, 'customer1', 16, 'DELIVERED', NULL,            13.48, 0, date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '11 hour', date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '11 hour'),
    (5204, 1026, 2, 'customer1', 17, 'CANCELLED', 'Pedido errado',  8.49, 0, date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '12 hour', date_trunc('day', CURRENT_TIMESTAMP) + INTERVAL '12 hour')
ON CONFLICT (id) DO NOTHING;

-- One row per ordered unit (matches the order_items model).
INSERT INTO order_items (id, order_id, item_name, notes)
VALUES
    (6001, 5001, 'Hamburguesa con Queso',        NULL),
    (6002, 5001, 'Malteada de Chocolate',        NULL),
    (6003, 5002, 'Hamburguesa con Queso',        'Sin pepinillos'),
    (6004, 5002, 'Sándwich de Pollo Crujiente',  NULL),
    (6005, 5003, 'Hamburguesa con Queso',        NULL),
    (6006, 5003, 'Malteada de Chocolate',        NULL),
    (6007, 5004, 'Hamburguesa con Queso',        NULL),
    (6008, 5005, 'Hamburguesa con Queso',        'Término medio'),
    (6009, 5005, 'Sándwich de Pollo Crujiente',  NULL),
    (6010, 5006, 'Sándwich de Pollo Crujiente',  NULL),
    (6011, 5006, 'Malteada de Chocolate',        NULL),
    (6012, 5007, 'Hamburguesa con Queso',        NULL),
    -- Items for the active kitchen queue (orders 5101–5106)
    (6101, 5101, 'Hamburguesa con Queso',        NULL),
    (6102, 5101, 'Malteada de Chocolate',        NULL),
    (6103, 5102, 'Sándwich de Pollo Crujiente',  'Para llevar'),
    (6104, 5103, 'Hamburguesa con Queso',        NULL),
    (6105, 5103, 'Sándwich de Pollo Crujiente',  NULL),
    (6106, 5103, 'Malteada de Chocolate',        NULL),
    (6107, 5104, 'Hamburguesa con Queso',        'Sin cebolla'),
    (6108, 5105, 'Sándwich de Pollo Crujiente',  NULL),
    (6109, 5105, 'Malteada de Chocolate',        NULL),
    (6110, 5106, 'Hamburguesa con Queso',        NULL),
    (6111, 5106, 'Sándwich de Pollo Crujiente',  NULL),
    -- Items for today's finished orders (5201–5204)
    (6201, 5201, 'Hamburguesa con Queso',        NULL),
    (6202, 5201, 'Malteada de Chocolate',        NULL),
    (6203, 5202, 'Hamburguesa con Queso',        NULL),
    (6204, 5203, 'Sándwich de Pollo Crujiente',  NULL),
    (6205, 5203, 'Malteada de Chocolate',        NULL),
    (6206, 5204, 'Sándwich de Pollo Crujiente',  'Pedido errado')
ON CONFLICT (id) DO NOTHING;

SELECT setval('orders_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM orders), 1));
SELECT setval('order_items_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM order_items), 1));
