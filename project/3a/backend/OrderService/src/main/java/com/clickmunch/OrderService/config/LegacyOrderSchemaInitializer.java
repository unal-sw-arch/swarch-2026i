package com.clickmunch.OrderService.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class LegacyOrderSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public LegacyOrderSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(org.springframework.boot.ApplicationArguments args) {
        applyOrderCompatibility();
        applyOrderItemCompatibility();
    }

    private void applyOrderCompatibility() {
        if (!columnExists("orders", "customer_id")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN customer_id SET DEFAULT 0");
        jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN customer_name SET DEFAULT 'UNKNOWN'");
        jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN restaurant_name SET DEFAULT 'UNKNOWN'");
        jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN channel SET DEFAULT 'IN_PERSON'");
        jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN total SET DEFAULT 0");
    }

    private void applyOrderItemCompatibility() {
        if (!columnExists("order_items", "menu_item_id")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE order_items ALTER COLUMN menu_item_id SET DEFAULT 'legacy-item'");
        jdbcTemplate.execute("ALTER TABLE order_items ALTER COLUMN product_name SET DEFAULT 'UNKNOWN'");
        jdbcTemplate.execute("ALTER TABLE order_items ALTER COLUMN quantity SET DEFAULT 1");
        jdbcTemplate.execute("ALTER TABLE order_items ALTER COLUMN unit_price SET DEFAULT 0");
        jdbcTemplate.execute("ALTER TABLE order_items ALTER COLUMN subtotal SET DEFAULT 0");
    }

    private boolean columnExists(String tableName, String columnName) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = ?
                      AND column_name = ?
                )
                """,
                Boolean.class,
                tableName,
                columnName
        );

        return Boolean.TRUE.equals(exists);
    }
}