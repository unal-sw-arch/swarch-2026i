package com.restaurant.orderservice.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Referencia externa al Catalog Service — sin FK a ninguna tabla local.
    // El Catalog Service es la fuente oficial del menu item.
    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;

    // Snapshot: nombre congelado al momento del pedido
    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    // Snapshot: precio unitario congelado al momento del pedido
    @Column(name = "unit_price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPriceSnapshot;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}
