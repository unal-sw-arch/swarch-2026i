package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.OrderItemResponse;
import com.restaurant.orderservice.application.dto.OrderResponse;
import com.restaurant.orderservice.domain.exception.OrderNotFoundException;
import com.restaurant.orderservice.domain.model.Order;
import com.restaurant.orderservice.domain.model.OrderItem;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetOrderByIdUseCase {

    private final OrderRepository orderRepository;

    // findByIdWithItems usa JOIN FETCH — trae pedido e items en una sola query
    // readOnly = true: optimización de sesión JPA, no hay escrituras
    @Transactional(readOnly = true)
    public OrderResponse execute(Long orderId) {
        log.debug("Consultando pedido id={}", orderId);

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        log.debug("Pedido id={} encontrado con {} items", orderId, order.getItems().size());

        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toOrderItemResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .restaurantId(order.getRestaurant().getId())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt().toInstant(ZoneOffset.UTC))
                .items(items)
                .build();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .productName(item.getProductNameSnapshot())
                .unitPrice(item.getUnitPriceSnapshot())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }
}
