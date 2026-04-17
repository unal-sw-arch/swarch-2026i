-- =============================================================
-- order-service — Datos semilla
-- Idempotente: ON CONFLICT DO NOTHING evita duplicados en reinicios
-- =============================================================

-- -------------------------------------------------------------
-- Restaurante semilla
-- -------------------------------------------------------------
INSERT INTO restaurants (id, name, code, address, phone, status)
VALUES (1, 'Restaurante La Abuela', 'REST-001', 'Calle 10 # 5-23, Bogotá', '6012345678', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Menú semilla
-- -------------------------------------------------------------
INSERT INTO menus (id, restaurant_id, name, description, status)
VALUES (1, 1, 'Menú del Día', 'Menú principal del restaurante', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 3 Productos semilla
-- -------------------------------------------------------------
INSERT INTO menu_items (id, menu_id, restaurant_id, name, description, price, category, is_available)
VALUES
    (101, 1, 1, 'Bandeja Paisa',    'Plato tradicional antioqueño con frijoles, arroz, chicharrón y más', 30000.00, 'MAIN',  TRUE),
    (102, 1, 1, 'Ajiaco Bogotano',  'Sopa típica bogotana con pollo, papas y guascas',                    22000.00, 'SOUP',  TRUE),
    (103, 1, 1, 'Jugo de Lulo',     'Jugo natural de lulo en agua o leche',                                5000.00, 'DRINK', TRUE)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- Ajuste de secuencias para evitar conflicto con IDs manuales
-- Garantiza que el próximo ID autogenerado sea mayor al seed
-- -------------------------------------------------------------
SELECT setval('restaurants_id_seq', (SELECT MAX(id) FROM restaurants));
SELECT setval('menus_id_seq',        (SELECT MAX(id) FROM menus));
SELECT setval('menu_items_id_seq',   (SELECT MAX(id) FROM menu_items));
