CREATE TABLE IF NOT EXISTS menu_categories (
           id SERIAL PRIMARY KEY,
           restaurant_id BIGINT NOT NULL,
           category VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
          id SERIAL PRIMARY KEY,
          category_id BIGINT NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price NUMERIC(10,2) NOT NULL,
          image_url TEXT,
          FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

