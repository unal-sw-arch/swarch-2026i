package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.OrderResponse;
import com.restaurant.orderservice.application.mapper.OrderMapper;
import com.restaurant.orderservice.domain.exception.ForbiddenException;
import com.restaurant.orderservice.domain.exception.OrderNotFoundException;
import com.restaurant.orderservice.domain.model.Order;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetOrderByIdUseCase {

    private final OrderRepository orderRepository;
    private final OrderMapper     orderMapper;

    @Transactional(readOnly = true)
    public OrderResponse execute(Long orderId, Long requestingUserId, String requestingUserRole, Long requestingRestaurantId) {
        Order order = orderRepository.findByIdWithItems(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        if ("CUSTOMER".equals(requestingUserRole)) {
            if (!order.getCustomerId().equals(requestingUserId)) {
                throw new ForbiddenException("No tienes acceso a este pedido");
            }
        } else if ("RESTAURANT".equals(requestingUserRole)) {
            if (!order.getRestaurantId().equals(requestingRestaurantId)) {
                throw new ForbiddenException("No tienes acceso a este pedido");
            }
        }

        return orderMapper.toOrderResponse(order);
    }
}
