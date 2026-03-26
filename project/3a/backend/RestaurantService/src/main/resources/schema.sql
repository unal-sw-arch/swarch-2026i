
CREATE TABLE IF NOT EXISTS restaurants (
       id SERIAL PRIMARY KEY,
       owner_id BIGINT NOT NULL,
       name VARCHAR(100) NOT NULL,
       description TEXT,
       phone VARCHAR(30),
       email VARCHAR(100),
       image_url TEXT,
       location_id BIGINT NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
);
