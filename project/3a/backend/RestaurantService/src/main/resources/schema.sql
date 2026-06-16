CREATE TABLE IF NOT EXISTS restaurants (
       id SERIAL PRIMARY KEY,
       owner_id BIGINT NOT NULL,
       name VARCHAR(100) NOT NULL,
       description TEXT,
       phone VARCHAR(30),
       email VARCHAR(100),
       image_url TEXT,
       location_id BIGINT NOT NULL,
       place_type VARCHAR(50) DEFAULT 'RESTAURANT',
       layout_cols INTEGER NOT NULL DEFAULT 16,
       layout_rows INTEGER NOT NULL DEFAULT 12,
       created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurant_profiles (
       restaurant_id BIGINT PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
       category VARCHAR(80),
       city VARCHAR(80),
       avg_price VARCHAR(30),
       delivery_time VARCHAR(30),
       badge VARCHAR(120),
       rating DOUBLE PRECISION DEFAULT 0,
       latitude DOUBLE PRECISION NOT NULL,
       longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurant_tables (
       id SERIAL PRIMARY KEY,
       restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
       table_number VARCHAR(20) NOT NULL,
       seats INTEGER NOT NULL DEFAULT 2,
       status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
       layout_x INTEGER NOT NULL DEFAULT 0,
       layout_y INTEGER NOT NULL DEFAULT 0,
       layout_width INTEGER NOT NULL DEFAULT 1,
       layout_height INTEGER NOT NULL DEFAULT 1,
       layout_shape TEXT
);

ALTER TABLE IF EXISTS restaurant_tables
       ADD COLUMN IF NOT EXISTS layout_x INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS restaurant_tables
       ADD COLUMN IF NOT EXISTS layout_y INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS restaurant_tables
       ADD COLUMN IF NOT EXISTS layout_width INTEGER NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS restaurant_tables
       ADD COLUMN IF NOT EXISTS layout_height INTEGER NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS restaurant_tables
       ADD COLUMN IF NOT EXISTS layout_shape TEXT;

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status ON restaurant_tables(restaurant_id, status);

CREATE TABLE IF NOT EXISTS operating_hours (
       id SERIAL PRIMARY KEY,
       restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
       day_of_week VARCHAR(20) NOT NULL,
       open_time TIME NOT NULL,
       close_time TIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_operating_hours_restaurant_id ON operating_hours(restaurant_id);

CREATE TABLE IF NOT EXISTS staff_assignments (
       id SERIAL PRIMARY KEY,
       restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
       user_id BIGINT NOT NULL,
       role VARCHAR(50) NOT NULL,
       active BOOLEAN NOT NULL DEFAULT true,
       assigned_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_assignments_restaurant_id ON staff_assignments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_user_id ON staff_assignments(user_id);

CREATE TABLE IF NOT EXISTS restaurant_admins (
       id SERIAL PRIMARY KEY,
       restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
       user_id BIGINT NOT NULL,
       assigned_at TIMESTAMP DEFAULT NOW(),
       UNIQUE(restaurant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_admins_restaurant_id ON restaurant_admins(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_admins_user_id ON restaurant_admins(user_id);

INSERT INTO restaurants (id, owner_id, name, description, phone, email, image_url, location_id)
VALUES
    (1001, 2, 'Kanka Peru', 'Comida peruana', '+57-300-000-0001', 'kanka@clickmunch.com', 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&h=700&fit=crop&auto=format', 1001),
    (1002, 2, 'Kong', 'Comida asiatica', '+57-300-000-0002', 'kong@clickmunch.com', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=700&fit=crop&auto=format', 1002),
    (1003, 2, 'El Carnal', 'Comida mexicana', '+57-300-000-0003', 'elcarnal@clickmunch.com', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&h=700&fit=crop&auto=format', 1003),
    (1004, 2, 'La Susheria', 'Sushi bar', '+57-300-000-0004', 'susheria@clickmunch.com', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&h=700&fit=crop&auto=format', 1004),
    (1005, 2, 'Mr Ribs - Parrilla', 'Parrilla premium', '+57-300-000-0005', 'mrribs@clickmunch.com', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=700&fit=crop&auto=format', 1005),
    (1006, 2, 'Lopez & Gracia', 'Cafe de especialidad', '+57-300-000-0006', 'lopezgracia@clickmunch.com', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=700&fit=crop&auto=format', 1006),
    (1007, 2, 'Tortas Deli - Postres', 'Postres artesanales', '+57-300-000-0007', 'tortasdeli@clickmunch.com', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=700&fit=crop&auto=format', 1007),
    (1008, 2, 'Maikki - Hamburguesa', 'Hamburguesas', '+57-300-000-0008', 'maikki@clickmunch.com', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=700&fit=crop&auto=format', 1008),
    (1009, 2, 'El Boliche - Pastas', 'Pastas italianas', '+57-300-000-0009', 'boliche@clickmunch.com', 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=1200&h=700&fit=crop&auto=format', 1009),
    (1010, 2, 'Los Pollitos', 'Pollo asado', '+57-300-000-0010', 'pollitos@clickmunch.com', 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200&h=700&fit=crop&auto=format', 1010)
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurant_profiles (restaurant_id, category, city, avg_price, delivery_time, badge, rating, latitude, longitude)
VALUES
    (1001, 'Peruana', 'Bogota', '$ 4.000', '12 min', 'Envio Gratis: Aplican TyC', 4.8, 4.648283, -74.107807),
    (1002, 'Asiatica', 'Bogota', '$ 4.000', '39 min', 'Envio Gratis: Aplican TyC', 4.4, 4.666353, -74.056624),
    (1003, 'Mexicana', 'Medellin', '$ 3.500', '34 min', 'Envio Gratis: Aplican TyC', 4.8, 6.208763, -75.567833),
    (1004, 'Sushi', 'Bogota', '$ 3.500', '24 min', 'Envio Gratis: min $60mil', 4.7, 4.701594, -74.041616),
    (1005, 'Parrilla', 'Bogota', '$ 4.500', '44 min', 'Envio Gratis: Aplican TyC', 4.8, 4.683985, -74.048659),
    (1006, 'Cafe', 'Cali', '$ 5.000', '24 min', 'Envio Gratis: Aplican TyC', 4.9, 3.451647, -76.532593),
    (1007, 'Postres', 'Bogota', '$ 3.000', '50 min', 'Envio Gratis: Aplican TyC', 4.3, 4.620977, -74.072932),
    (1008, 'Hamburguesas', 'Barranquilla', '$ 3.000', '34 min', 'Envio Gratis: Aplican TyC', 4.5, 10.987004, -74.799316),
    (1009, 'Pastas', 'Bogota', '$ 4.500', '51 min', 'Envio Gratis: Aplican TyC', 4.6, 4.711000, -74.072100),
    (1010, 'Pollo', 'Medellin', '$ 3.000', '34 min', 'Envio Gratis: Aplican TyC', 4.7, 6.251840, -75.563591)
ON CONFLICT (restaurant_id) DO NOTHING;

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS place_type VARCHAR(50) DEFAULT 'RESTAURANT';

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS layout_cols INTEGER NOT NULL DEFAULT 16;

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS layout_rows INTEGER NOT NULL DEFAULT 12;

ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT FALSE;

UPDATE restaurant_profiles SET free_shipping = TRUE
WHERE badge LIKE '%Envio Gratis%' AND free_shipping = FALSE;

INSERT INTO restaurants (id, owner_id, name, description, phone, email, image_url, location_id)
VALUES
    (1011, 2, 'Marea',            'Mariscos del Caribe',         '+57-315-001-1011', 'marea@clickmunch.com',     'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&h=700&fit=crop&auto=format', 1011),
    (1012, 2, 'Carbón de Palo',   'Parrilla artesanal',          '+57-315-001-1012', 'carbon@clickmunch.com',    'https://images.unsplash.com/photo-1529708138-b4ae6a8b4d2f?w=1200&h=700&fit=crop&auto=format', 1012),
    (1013, 2, 'El Rancherito',    'Comida típica colombiana',    '+57-315-001-1013', 'rancherito@clickmunch.com','https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1200&h=700&fit=crop&auto=format', 1013),
    (1014, 2, 'Quintonil',        'Alta cocina mexicana',        '+52-555-001-1014', 'quintonil@clickmunch.com', 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=1200&h=700&fit=crop&auto=format', 1014),
    (1015, 2, 'La Docena',        'Mariscos y ostiones frescos', '+52-333-001-1015', 'ladocena@clickmunch.com',  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&h=700&fit=crop&auto=format', 1015),
    (1016, 2, 'Don Julio',        'Parrilla porteña premium',    '+54-11-001-1016',  'donjulio@clickmunch.com',  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=700&fit=crop&auto=format', 1016),
    (1017, 2, 'Maido',            'Cocina nikkei peruana',       '+51-1-001-1017',   'maido@clickmunch.com',     'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=700&fit=crop&auto=format', 1017),
    (1018, 2, 'Boragó',           'Cocina chilena de autor',     '+56-2-001-1018',   'borago@clickmunch.com',    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=700&fit=crop&auto=format', 1018),
    (1019, 2, 'Tickets',          'Tapas de vanguardia',         '+34-93-001-1019',  'tickets@clickmunch.com',   'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=1200&h=700&fit=crop&auto=format', 1019),
    (1020, 2, 'Sala de Despiece', 'Cocina española contemporánea','+34-91-001-1020', 'despiece@clickmunch.com',  'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=1200&h=700&fit=crop&auto=format', 1020),
    (1021, 2, 'Zuma',             'Cocina japonesa informal',    '+1-305-001-1021',  'zuma@clickmunch.com',      'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&h=700&fit=crop&auto=format', 1021),
    (1022, 2, 'Cosme',            'Mexicana de autor en NYC',    '+1-212-001-1022',  'cosme@clickmunch.com',     'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200&h=700&fit=crop&auto=format', 1022),
    (1023, 2, 'Mocotó',           'Cocina nordestina brasileña', '+55-11-001-1023',  'mocoto@clickmunch.com',    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=700&fit=crop&auto=format', 1023),
    (1024, 2, 'Brasserie Flo',    'Brasserie francesa clásica',  '+33-1-001-1024',   'flo@clickmunch.com',       'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=700&fit=crop&auto=format', 1024),
    (1025, 2, 'Narisawa',         'Cocina japonesa innovadora',  '+81-3-001-1025',   'narisawa@clickmunch.com',  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=700&fit=crop&auto=format', 1025)
ON CONFLICT (id) DO NOTHING;

INSERT INTO restaurant_profiles (restaurant_id, category, city, avg_price, delivery_time, badge, rating, latitude, longitude, free_shipping)
VALUES
    (1011, 'Mariscos',  'Cartagena',       '$ 38.000',   '28 min', 'Envio Gratis: Aplican TyC', 4.7, 10.391000, -75.479400, TRUE),
    (1012, 'Parrilla',  'Bucaramanga',     '$ 45.000',   '35 min', NULL,                        4.6,  7.119300, -73.122700, FALSE),
    (1013, 'Típica',    'Pereira',         '$ 22.000',   '30 min', 'Envio Gratis: Aplican TyC', 4.5,  4.813300, -75.696100, TRUE),
    (1014, 'Mexicana',  'Ciudad de Mexico','$ 180 MXN',  '45 min', NULL,                        4.9, 19.432600, -99.133200, FALSE),
    (1015, 'Mariscos',  'Guadalajara',     '$ 150 MXN',  '38 min', 'Envio Gratis: min $200 MXN',4.8, 20.659700,-103.349600, TRUE),
    (1016, 'Parrilla',  'Buenos Aires',    '$ 3.500 ARS','50 min', NULL,                        4.9,-34.603700, -58.381600, FALSE),
    (1017, 'Nikkei',    'Lima',            'S/ 85',      '40 min', 'Envio Gratis: Aplican TyC', 4.8,-12.046400, -77.042800, TRUE),
    (1018, 'Chilena',   'Santiago',        '$ 25.000 CLP','42 min','Envio Gratis: Aplican TyC', 4.7,-33.448900, -70.669300, TRUE),
    (1019, 'Tapas',     'Barcelona',       '€ 22',       '35 min', 'Envio Gratis: Aplican TyC', 4.9, 41.385100,   2.173400, TRUE),
    (1020, 'Española',  'Madrid',          '€ 18',       '38 min', NULL,                        4.7, 40.416800,  -3.703800, FALSE),
    (1021, 'Japonesa',  'Miami',           '$ 35 USD',   '40 min', 'Envio Gratis: Aplican TyC', 4.8, 25.761700, -80.191800, TRUE),
    (1022, 'Mexicana',  'New York',        '$ 28 USD',   '45 min', NULL,                        4.8, 40.712800, -74.006000, FALSE),
    (1023, 'Brasileña', 'Sao Paulo',       'R$ 55',      '35 min', 'Envio Gratis: Aplican TyC', 4.6,-23.548900, -46.638800, TRUE),
    (1024, 'Francesa',  'Paris',           '€ 28',       '50 min', NULL,                        4.8, 48.858400,   2.294500, FALSE),
    (1025, 'Japonesa',  'Tokyo',           '¥ 8.000',    '55 min', 'Envio Gratis: Aplican TyC', 4.9, 35.676200, 139.650300, TRUE)
ON CONFLICT (restaurant_id) DO NOTHING;

SELECT setval('restaurants_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM restaurants), 1));
