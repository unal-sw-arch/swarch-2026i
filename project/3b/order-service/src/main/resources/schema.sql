-- =============================================================
-- order-service — Schema inicial
-- Idempotente: seguro de ejecutar múltiples veces
-- =============================================================

-- Eliminar tablas en orden inverso de dependencias
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

CREATE TABLE restaurants (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)        NOT NULL,
    code        VARCHAR(100)        NOT NULL UNIQUE,
    address     VARCHAR(255)        NOT NULL,
    phone       VARCHAR(50)         NOT NULL,
    status      VARCHAR(50)         NOT NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT          NOT NULL REFERENCES restaurants(id),
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    status          VARCHAR(50)     NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
    id              BIGSERIAL PRIMARY KEY,
    menu_id         BIGINT          NOT NULL REFERENCES menus(id),
    restaurant_id   BIGINT          NOT NULL REFERENCES restaurants(id),
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2)  NOT NULL,
    category        VARCHAR(100)    NOT NULL,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT          NOT NULL REFERENCES restaurants(id),
    customer_name   VARCHAR(255)    NOT NULL,
    customer_phone  VARCHAR(50)     NOT NULL,
    status          VARCHAR(50)     NOT NULL,
    total_amount    NUMERIC(12, 2)  NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id                      BIGSERIAL PRIMARY KEY,
    order_id                BIGINT          NOT NULL REFERENCES orders(id),
    menu_item_id            BIGINT          NOT NULL REFERENCES menu_items(id),
    product_name_snapshot   VARCHAR(255)    NOT NULL,
    unit_price_snapshot     NUMERIC(12, 2)  NOT NULL,
    quantity                INT             NOT NULL,
    subtotal                NUMERIC(12, 2)  NOT NULL
);
