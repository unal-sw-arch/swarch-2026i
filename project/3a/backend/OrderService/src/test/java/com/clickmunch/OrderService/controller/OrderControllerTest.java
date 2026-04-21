package com.clickmunch.OrderService.controller;

import com.clickmunch.OrderService.dto.*;
import com.clickmunch.OrderService.service.OrderService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    private OrderResponse sampleOrder() {
        return new OrderResponse(1L, 10L, 5, "PENDING", "No onions",
                LocalDateTime.now(), LocalDateTime.now(),
                List.of(
                        new OrderItemResponse(1L, "Burger", "sin lechuga"),
                        new OrderItemResponse(2L, "Burger", "con todo")
                ));
    }

    @Test
    void createOrder_returns201() throws Exception {
        Mockito.when(orderService.createOrder(Mockito.any(CreateOrderRequest.class)))
                .thenReturn(new ApiResponse<>("Order created successfully", sampleOrder()));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "restaurantId": 10,
                                  "tableNumber": 5,
                                  "notes": "No onions",
                                  "items": [
                                    {"itemName": "Burger", "notes": "sin lechuga"},
                                    {"itemName": "Burger", "notes": "con todo"}
                                  ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Order created successfully"))
                .andExpect(jsonPath("$.data.tableNumber").value(5))
                .andExpect(jsonPath("$.data.items", org.hamcrest.Matchers.hasSize(2)));
    }

    @Test
    void createOrder_withEmptyItems_returns400() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "restaurantId": 10,
                                  "tableNumber": 5,
                                  "items": []
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getOrder_returns200() throws Exception {
        Mockito.when(orderService.getOrder(1L))
                .thenReturn(new ApiResponse<>("Order retrieved", sampleOrder()));

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getOrder_notFound_returns404() throws Exception {
        Mockito.when(orderService.getOrder(999L))
                .thenThrow(new RuntimeException("Order not found"));

        mockMvc.perform(get("/api/orders/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order not found"));
    }

    @Test
    void getKitchenOrders_returns200() throws Exception {
        Mockito.when(orderService.getKitchenOrders(10L))
                .thenReturn(new ApiResponse<>("Active kitchen orders", List.of(sampleOrder())));

        mockMvc.perform(get("/api/orders/kitchen/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }

    @Test
    void getRestaurantOrders_withStatusFilter_returns200() throws Exception {
        Mockito.when(orderService.getRestaurantOrders(10L, "PENDING"))
                .thenReturn(new ApiResponse<>("Restaurant orders", List.of(sampleOrder())));

        mockMvc.perform(get("/api/orders/restaurant/10").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void updateStatus_returns200() throws Exception {
        OrderResponse updated = new OrderResponse(1L, 10L, 5, "IN_PREPARATION", null,
                LocalDateTime.now(), LocalDateTime.now(),
                List.of(new OrderItemResponse(1L, "Burger", null)));
        Mockito.when(orderService.updateStatus(Mockito.eq(1L), Mockito.any(UpdateStatusRequest.class)))
                .thenReturn(new ApiResponse<>("Order status updated to IN_PREPARATION", updated));

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "IN_PREPARATION"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PREPARATION"));
    }

    @Test
    void updateStatus_invalidTransition_returns400() throws Exception {
        Mockito.when(orderService.updateStatus(Mockito.eq(1L), Mockito.any(UpdateStatusRequest.class)))
                .thenThrow(new RuntimeException("Invalid transition from PENDING to DELIVERED"));

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "DELIVERED"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid transition from PENDING to DELIVERED"));
    }
}
