package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.CreateOrderRequest;
import com.restaurant.orderservice.application.dto.OrderResponse;
import com.restaurant.orderservice.application.mapper.OrderMapper;
import com.restaurant.orderservice.domain.exception.MenuItemNotAvailableException;
import com.restaurant.orderservice.domain.exception.MenuItemNotFoundException;
import com.restaurant.orderservice.domain.model.Order;
import com.restaurant.orderservice.domain.model.OrderItem;
import com.restaurant.orderservice.domain.model.OrderStatus;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import com.restaurant.orderservice.infrastructure.client.CatalogClient;
import com.restaurant.orderservice.infrastructure.client.TrackingServiceClient;
import com.restaurant.orderservice.infrastructure.client.dto.ActivityEventDto;
import com.restaurant.orderservice.infrastructure.client.dto.CatalogMenuItemDto;
import com.restaurant.orderservice.infrastructure.messaging.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateOrderUseCase {

    private final OrderRepository      orderRepository;
    private final CatalogClient        catalogClient;
    private final TrackingServiceClient trackingServiceClient;
    private final OrderEventPublisher  orderEventPublisher;
    private final OrderMapper          orderMapper;

    @Transactional
    public OrderResponse execute(CreateOrderRequest request, Long customerId) {
        catalogClient.validateRestaurantExists(request.getRestaurantId());

        List<Long> menuItemIds = request.getItems().stream()
            .map(i -> i.getMenuItemId())
            .collect(Collectors.toList());

        Map<Long, CatalogMenuItemDto> catalogItems = catalogClient.getMenuItems(menuItemIds)
            .stream()
            .collect(Collectors.toMap(CatalogMenuItemDto::getId, Function.identity()));

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setRestaurantId(request.getRestaurantId());
        order.setStatus(OrderStatus.CREATED);
        order.setNotes(request.getNotes());

        BigDecimal total = BigDecimal.ZERO;

        for (var itemReq : request.getItems()) {
            CatalogMenuItemDto catalogItem = catalogItems.get(itemReq.getMenuItemId());
            if (catalogItem == null) throw new MenuItemNotFoundException(itemReq.getMenuItemId());
            if (!catalogItem.isAvailable()) throw new MenuItemNotAvailableException(catalogItem.getId(), catalogItem.getName());
            if (!request.getRestaurantId().equals(catalogItem.getRestaurantId())) {
                throw new MenuItemNotFoundException(itemReq.getMenuItemId());
            }

            BigDecimal subtotal = catalogItem.getPrice()
                .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(subtotal);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItemId(catalogItem.getId());
            item.setProductNameSnapshot(catalogItem.getName());
            item.setUnitPriceSnapshot(catalogItem.getPrice());
            item.setQuantity(itemReq.getQuantity());
            item.setSubtotal(subtotal);

            order.getItems().add(item);
        }

        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);
        log.info("Order {} created for customer {}", saved.getId(), customerId);

        orderEventPublisher.publishOrderCreated(saved);

        ActivityEventDto event = ActivityEventDto.builder()
            .eventType("ORDER_CREATED")
            .entityType("ORDER")
            .entityId(saved.getId().toString())
            .restaurantId(saved.getRestaurantId())
            .orderId(saved.getId().toString())
            .timestamp(java.time.Instant.now().toString())
            .sourceService("order-service")
            .payload(Map.of("status", saved.getStatus().name()))
            .build();
        trackingServiceClient.publishActivityEvent(event);

        return orderMapper.toOrderResponse(saved);
    }
}
