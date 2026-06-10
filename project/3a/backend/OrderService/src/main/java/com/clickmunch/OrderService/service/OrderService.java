package com.clickmunch.OrderService.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickmunch.OrderService.dto.ApiResponse;
import com.clickmunch.OrderService.dto.CreateOrderRequest;
import com.clickmunch.OrderService.dto.OrderItemResponse;
import com.clickmunch.OrderService.dto.OrderResponse;
import com.clickmunch.OrderService.dto.UpdateStatusRequest;
import com.clickmunch.OrderService.entity.Order;
import com.clickmunch.OrderService.entity.OrderItem;
import com.clickmunch.OrderService.entity.OrderStatus;
import com.clickmunch.OrderService.realtime.KitchenEventsPublisher;
import com.clickmunch.OrderService.repository.OrderItemRepository;
import com.clickmunch.OrderService.repository.OrderRepository;

@Service
public class OrderService {

    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = Map.of(
            OrderStatus.PENDING,        Set.of(OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED),
            OrderStatus.IN_PREPARATION, Set.of(OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.READY,          Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED,      Set.of(),
            OrderStatus.CANCELLED,      Set.of()
    );

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final KitchenEventsPublisher events;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        KitchenEventsPublisher events) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.events = events;
    }

    @Transactional
    public ApiResponse<OrderResponse> createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setRestaurantId(request.restaurantId());
        order.setTableNumber(request.tableNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setNotes(request.notes());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        List<OrderItem> items = request.items().stream().map(itemReq -> {
            OrderItem item = new OrderItem();
            item.setOrderId(saved.getId());
            item.setItemName(itemReq.itemName());
            item.setNotes(itemReq.notes());
            return item;
        }).toList();

        List<OrderItem> savedItems = orderItemRepository.saveAll(items);

        OrderResponse response = toResponse(saved, savedItems);
        events.publishCreated(response);
        return new ApiResponse<>("Order created successfully", response);
    }

    public ApiResponse<OrderResponse> getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return new ApiResponse<>("Order retrieved", toResponse(order, items));
    }

    public ApiResponse<List<OrderResponse>> getKitchenOrders(Long restaurantId) {
        List<Order> orders = orderRepository.findActiveByRestaurantId(restaurantId);
        return new ApiResponse<>("Active kitchen orders", toResponseList(orders));
    }

    public ApiResponse<List<OrderResponse>> getRestaurantOrders(Long restaurantId, String status) {
        List<Order> orders;
        if (status != null && !status.isBlank()) {
            OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByRestaurantIdAndStatus(restaurantId, status.toUpperCase());
        } else {
            orders = orderRepository.findByRestaurantId(restaurantId);
        }
        return new ApiResponse<>("Restaurant orders", toResponseList(orders));
    }

    public ApiResponse<OrderResponse> updateStatus(Long id, UpdateStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + request.status());
        }

        Set<OrderStatus> allowed = TRANSITIONS.get(order.getStatus());
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new RuntimeException(
                    "Invalid transition from " + order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        OrderResponse response = toResponse(updated, items);
        events.publishStatusChanged(response);
        return new ApiResponse<>("Order status updated to " + newStatus, response);
    }

    private List<OrderResponse> toResponseList(List<Order> orders) {
        if (orders.isEmpty()) return List.of();

        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);
        Map<Long, List<OrderItem>> itemsByOrder = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));

        return orders.stream()
                .map(o -> toResponse(o, itemsByOrder.getOrDefault(o.getId(), List.of())))
                .toList();
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(i -> new OrderItemResponse(i.getId(), i.getItemName(), i.getNotes()))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getRestaurantId(),
                order.getTableNumber(),
                order.getStatus().name(),
                order.getNotes(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses
        );
    }
}
