CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    restaurant_id BIGINT       NOT NULL,
    table_number  INT          NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notes         TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Local developer databases may still contain the older order schema.
-- Keep startup idempotent and patch legacy columns/defaults in place so the
-- current service model can run without requiring manual volume deletion.
ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS table_number INT;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN table_number SET DEFAULT 0;

UPDATE orders
SET table_number = COALESCE(table_number, 0)
WHERE table_number IS NULL;

ALTER TABLE IF EXISTS orders
    ALTER COLUMN table_number SET NOT NULL;

UPDATE orders
SET status = CASE UPPER(status)
    WHEN 'PREPARING' THEN 'IN_PREPARATION'
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

UPDATE order_items
SET item_name = COALESCE(item_name, product_name, 'UNKNOWN')
WHERE item_name IS NULL;

ALTER TABLE IF EXISTS order_items
    ALTER COLUMN item_name SET DEFAULT 'UNKNOWN';

ALTER TABLE IF EXISTS order_items
    ALTER COLUMN item_name SET NOT NULL;
