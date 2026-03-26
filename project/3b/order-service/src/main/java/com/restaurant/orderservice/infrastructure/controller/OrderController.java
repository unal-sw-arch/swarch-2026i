package com.restaurant.orderservice.infrastructure.controller;

import com.restaurant.orderservice.application.dto.CreateOrderRequest;
import com.restaurant.orderservice.application.dto.OrderResponse;
import com.restaurant.orderservice.application.usecase.CreateOrderUseCase;
import com.restaurant.orderservice.application.usecase.GetOrderByIdUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderByIdUseCase getOrderByIdUseCase;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = createOrderUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(getOrderByIdUseCase.execute(id));
    }
}
