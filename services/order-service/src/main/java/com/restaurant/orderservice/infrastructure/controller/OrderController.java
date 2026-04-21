package com.restaurant.orderservice.infrastructure.controller;

import com.restaurant.orderservice.application.dto.*;
import com.restaurant.orderservice.application.usecase.*;
import com.restaurant.orderservice.infrastructure.security.AuthContext;
import com.restaurant.orderservice.infrastructure.security.AuthContextHolder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controllers delgados: solo despachan al use case correcto.
 * El AuthContext viene del AuthContextFilter vía AuthContextHolder.
 * Fase 7 añadirá validación explícita de contexto (403 si falta el header).
 */
@RestController
@RequiredArgsConstructor
public class OrderController {

    private final CreateOrderUseCase          createOrderUseCase;
    private final GetOrderByIdUseCase         getOrderByIdUseCase;
    private final GetCustomerOrdersUseCase    getCustomerOrdersUseCase;
    private final GetRestaurantOrdersUseCase  getRestaurantOrdersUseCase;

    // POST /orders
    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        AuthContext auth = AuthContextHolder.require();
        OrderResponse response = createOrderUseCase.execute(request, auth.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /orders/{id}
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        AuthContext auth = AuthContextHolder.require();
        return ResponseEntity.ok(getOrderByIdUseCase.execute(id, auth.userId(), auth.role(), auth.restaurantId()));
    }

    // GET /customers/me/orders
    @GetMapping("/customers/me/orders")
    public ResponseEntity<OrderListResponse<CustomerOrderSummary>> getCustomerOrders() {
        AuthContext auth = AuthContextHolder.require();
        return ResponseEntity.ok(
            new OrderListResponse<>(getCustomerOrdersUseCase.execute(auth.userId()))
        );
    }

    // GET /restaurants/me/orders
    @GetMapping("/restaurants/me/orders")
    public ResponseEntity<OrderListResponse<RestaurantOrderSummary>> getRestaurantOrders() {
        AuthContext auth = AuthContextHolder.require();
        return ResponseEntity.ok(
            new OrderListResponse<>(getRestaurantOrdersUseCase.execute(auth.restaurantId()))
        );
    }
}
