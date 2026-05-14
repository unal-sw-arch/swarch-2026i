CREATE TABLE IF NOT EXISTS restaurant_ratings (
    id SERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(100),
    restaurant_id BIGINT NOT NULL,
    restaurant_name VARCHAR(200),
    order_id BIGINT,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waiter_ratings (
    id SERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(100),
    waiter_id BIGINT NOT NULL,
    waiter_name VARCHAR(100),
    restaurant_id BIGINT NOT NULL,
    order_id BIGINT,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_restaurant_ratings_restaurant ON restaurant_ratings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_ratings_customer ON restaurant_ratings(customer_id);
CREATE INDEX IF NOT EXISTS idx_waiter_ratings_waiter ON waiter_ratings(waiter_id);
CREATE INDEX IF NOT EXISTS idx_waiter_ratings_restaurant ON waiter_ratings(restaurant_id);
