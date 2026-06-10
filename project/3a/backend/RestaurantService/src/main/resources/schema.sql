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
       status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
);

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

SELECT setval('restaurants_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM restaurants), 1));
