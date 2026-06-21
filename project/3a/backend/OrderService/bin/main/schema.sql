CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    restaurant_id BIGINT       NOT NULL,
    customer_id   BIGINT,
    customer_name VARCHAR(120),
    table_number  INT          NOT NULL,
    table_id      BIGINT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notes         TEXT,
    total_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    priority      INT          NOT NULL DEFAULT 0,
    requested_arrival_time TIMESTAMP,
    arrival_message TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Local developer databases may still contain the older order schema.
-- Keep startup idempotent and patch legacy columns/defaults in place so the
-- current service model can run without requiring manual volume deletion.
ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS table_number INT;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS table_id BIGINT;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS customer_id BIGINT;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(120);

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) DEFAULT 0;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS requested_arrival_time TIMESTAMP;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS arrival_message TEXT;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN table_number SET DEFAULT 0;

UPDATE orders
SET table_number = COALESCE(table_number, 0)
WHERE table_number IS NULL;

UPDATE orders
SET total_amount = COALESCE(total_amount, 0)
WHERE total_amount IS NULL;

UPDATE orders
SET priority = COALESCE(priority, 0)
WHERE priority IS NULL;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN table_number SET NOT NULL;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN total_amount SET DEFAULT 0;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN total_amount SET NOT NULL;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN priority SET DEFAULT 0;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN priority SET NOT NULL;

UPDATE orders
SET status = CASE UPPER(status)
    WHEN 'PREPARING' THEN 'IN_PREPARATION'
    WHEN 'IN_PREPARATION' THEN 'IN_PREPARATION'
    WHEN 'READY' THEN 'READY'
    WHEN 'SERVED' THEN 'DELIVERED'
    WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    WHEN 'PENDING' THEN 'PENDING'
    ELSE 'PENDING'
END
WHERE status IS NOT NULL;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN status TYPE VARCHAR(20);

ALTER TABLE IF EXISTS orders
    ALTER COLUMN status SET DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created_at ON orders(restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_priority ON orders(restaurant_id, priority DESC, created_at ASC);

-- One row per ordered unit so per-unit notes (e.g. "sin lechuga") can differ
-- between two units of the same item. The frontend groups visually by
-- (item_name, notes) when showing the kitchen view.
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_name  VARCHAR(200) NOT NULL,
    notes      TEXT
);

ALTER TABLE IF EXISTS order_items
    ADD COLUMN IF NOT EXISTS item_name VARCHAR(200);

ALTER TABLE IF EXISTS order_items
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Legacy databases stored the dish name in `product_name`. Add the column if it
-- is missing so the COALESCE below resolves on fresh databases (no rows), then
-- migrate any legacy values into `item_name` and drop the obsolete column.
ALTER TABLE IF EXISTS order_items
    ADD COLUMN IF NOT EXISTS product_name VARCHAR(200);

UPDATE order_items
SET item_name = 'UNKNOWN'
WHERE item_name IS NULL;

ALTER TABLE IF EXISTS order_items
    DROP COLUMN IF EXISTS product_name;

ALTER TABLE IF EXISTS order_items
    ALTER COLUMN item_name SET DEFAULT 'UNKNOWN';

ALTER TABLE IF EXISTS order_items
    ALTER COLUMN item_name SET NOT NULL;
