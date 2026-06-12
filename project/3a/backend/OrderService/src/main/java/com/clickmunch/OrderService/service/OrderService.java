package com.clickmunch.OrderService.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickmunch.OrderService.client.GeoClient;
import com.clickmunch.OrderService.dto.ApiResponse;
import com.clickmunch.OrderService.dto.CreateOrderRequest;
import com.clickmunch.OrderService.dto.MonthlyEarningsResponse;
import com.clickmunch.OrderService.dto.OrderArrivalUpdateRequest;
import com.clickmunch.OrderService.dto.OrderCancellationRequest;
import com.clickmunch.OrderService.dto.OrderEtaResponse;
import com.clickmunch.OrderService.dto.OrderItemResponse;
import com.clickmunch.OrderService.dto.OrderPriorityRequest;
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
            OrderStatus.READY,          Set.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
            OrderStatus.DELIVERED,      Set.of(),
            OrderStatus.CANCELLED,      Set.of()
    );

        private static final double WALKING_METERS_PER_MINUTE = 83.3;
        private static final double DRIVING_METERS_PER_MINUTE = 666.7;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final KitchenEventsPublisher events;
        private final GeoClient geoClient;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                KitchenEventsPublisher events,
                GeoClient geoClient) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.events = events;
        this.geoClient = geoClient;
    }

    @Transactional
    public ApiResponse<OrderResponse> createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setRestaurantId(request.restaurantId());
        order.setCustomerId(request.customerId());
        order.setCustomerName(request.customerName());
        order.setTableNumber(request.tableNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setNotes(request.notes());
        order.setTotalAmount(request.totalAmount() != null ? request.totalAmount() : BigDecimal.ZERO);
        order.setPriority(0);
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

    public ApiResponse<List<OrderResponse>> getCustomerOrders(Long customerId) {
        return new ApiResponse<>("Customer orders", toResponseList(orderRepository.findByCustomerId(customerId)));
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
        if (newStatus == OrderStatus.CANCELLED) {
            order.setCancelledAt(LocalDateTime.now());
        }
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        OrderResponse response = toResponse(updated, items);
        events.publishStatusChanged(response);
        return new ApiResponse<>("Order status updated to " + newStatus, response);
    }

    public ApiResponse<OrderResponse> requestArrivalChange(Long id, OrderArrivalUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Arrival time can only be changed before preparation starts");
        }
        order.setRequestedArrivalTime(request.requestedArrivalTime());
        order.setArrivalMessage(request.message());
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);
        return new ApiResponse<>("Arrival time change requested", toResponse(updated, orderItemRepository.findByOrderId(id)));
    }

    public ApiResponse<OrderResponse> updatePriority(Long id, OrderPriorityRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPriority(request.priority());
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);
        return new ApiResponse<>("Order priority updated", toResponse(updated, orderItemRepository.findByOrderId(id)));
    }

    public ApiResponse<OrderResponse> cancelOrder(Long id, OrderCancellationRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Set<OrderStatus> allowed = TRANSITIONS.get(order.getStatus());
        if (allowed == null || !allowed.contains(OrderStatus.CANCELLED)) {
            throw new RuntimeException("Order cannot be cancelled from status " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.reason());
        order.setCancelledAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);
        OrderResponse response = toResponse(updated, orderItemRepository.findByOrderId(id));
        events.publishStatusChanged(response);
        return new ApiResponse<>("Order cancelled", response);
    }

    public ApiResponse<OrderEtaResponse> getOrderEta(Long id, Double latitude, Double longitude, String mode) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        String normalizedMode = mode == null || mode.isBlank() ? "DRIVING" : mode.toUpperCase();
        double metersPerMinute = switch (normalizedMode) {
            case "WALKING" -> WALKING_METERS_PER_MINUTE;
            case "DRIVING" -> DRIVING_METERS_PER_MINUTE;
            default -> throw new RuntimeException("Invalid ETA mode: " + mode);
        };
        Double distanceMeters = geoClient.getDistanceMeters(order.getRestaurantId(), latitude, longitude);
        Double etaMinutes = distanceMeters == null ? null : Math.ceil(distanceMeters / metersPerMinute);
        return new ApiResponse<>("Order ETA", new OrderEtaResponse(id, order.getRestaurantId(), normalizedMode, etaMinutes));
    }

    public ApiResponse<MonthlyEarningsResponse> getMonthlyEarnings(Long restaurantId, Integer year, Integer month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.plusMonths(1).atDay(1).atStartOfDay();
        List<Order> deliveredOrders = orderRepository.findDeliveredByRestaurantIdBetween(restaurantId, start, end);
        BigDecimal gross = deliveredOrders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = deliveredOrders.size();
        BigDecimal average = count == 0
                ? BigDecimal.ZERO
                : gross.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
        return new ApiResponse<>("Monthly earnings", new MonthlyEarningsResponse(
                restaurantId,
                year,
                month,
                gross,
                count,
                average));
    }

    public ApiResponse<String> getTopDeliveredDish(Long restaurantId) {
        String dish = orderRepository.findTopDeliveredDishByRestaurantId(restaurantId);
        return new ApiResponse<>("Top delivered dish", dish);
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
        Integer priority = order.getPriority();
        if (priority == null) {
            priority = 0;
        }

        return new OrderResponse(
                order.getId(),
                order.getRestaurantId(),
            order.getCustomerId(),
            order.getCustomerName(),
                order.getTableNumber(),
                order.getStatus().name(),
                order.getNotes(),
            order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO,
                priority,
            order.getRequestedArrivalTime(),
            order.getArrivalMessage(),
            order.getCancellationReason(),
            order.getCancelledAt(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses
        );
    }
}
