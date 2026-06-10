package com.clickmunch.OrderService.controller;

import com.clickmunch.OrderService.dto.*;
import com.clickmunch.OrderService.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order lifecycle management")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create a new order")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping
    public ResponseEntity<com.clickmunch.OrderService.dto.ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        var response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get a single order by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<com.clickmunch.OrderService.dto.ApiResponse<OrderResponse>> getOrder(
            @Parameter(description = "Order ID") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrder(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new com.clickmunch.OrderService.dto.ApiResponse<>(e.getMessage(), null));
        }
    }

    @Operation(summary = "Get active kitchen orders (PENDING + IN_PREPARATION + READY) in FIFO order")
    @GetMapping("/kitchen/{restaurantId}")
    public ResponseEntity<com.clickmunch.OrderService.dto.ApiResponse<List<OrderResponse>>> getKitchenOrders(
            @Parameter(description = "Restaurant ID") @PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getKitchenOrders(restaurantId));
    }

    @Operation(summary = "Get all orders for a restaurant, optionally filtered by status")
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<com.clickmunch.OrderService.dto.ApiResponse<List<OrderResponse>>> getRestaurantOrders(
            @Parameter(description = "Restaurant ID") @PathVariable Long restaurantId,
            @Parameter(description = "Filter by status (e.g. PENDING, READY)") @RequestParam(required = false) String status) {
        try {
            return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new com.clickmunch.OrderService.dto.ApiResponse<>("Invalid status value", null));
        }
    }

    @Operation(summary = "Update order status (state machine enforced)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "400", description = "Invalid transition"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<com.clickmunch.OrderService.dto.ApiResponse<OrderResponse>> updateStatus(
            @Parameter(description = "Order ID") @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        try {
            return ResponseEntity.ok(orderService.updateStatus(id, request));
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new com.clickmunch.OrderService.dto.ApiResponse<>(msg, null));
            }
            return ResponseEntity.badRequest()
                    .body(new com.clickmunch.OrderService.dto.ApiResponse<>(msg, null));
        }
    }
}
