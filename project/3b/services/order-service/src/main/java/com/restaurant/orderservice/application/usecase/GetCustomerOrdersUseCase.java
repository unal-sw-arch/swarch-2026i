package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.CustomerOrderSummary;
import com.restaurant.orderservice.application.mapper.OrderMapper;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetCustomerOrdersUseCase {

    private final OrderRepository orderRepository;
    private final OrderMapper     orderMapper;

    @Transactional(readOnly = true)
    public List<CustomerOrderSummary> execute(Long customerId) {
        return orderRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerId)
            .stream()
            .map(orderMapper::toCustomerSummary)
            .collect(Collectors.toList());
    }
}
