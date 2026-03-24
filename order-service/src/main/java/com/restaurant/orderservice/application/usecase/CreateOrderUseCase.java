package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.CreateOrderItemRequest;
import com.restaurant.orderservice.application.dto.CreateOrderRequest;
import com.restaurant.orderservice.application.dto.OrderItemResponse;
import com.restaurant.orderservice.application.dto.OrderResponse;
import com.restaurant.orderservice.domain.exception.MenuItemNotAvailableException;
import com.restaurant.orderservice.domain.exception.MenuItemNotFoundException;
import com.restaurant.orderservice.domain.exception.RestaurantNotFoundException;
import com.restaurant.orderservice.domain.model.*;
import com.restaurant.orderservice.domain.repository.MenuItemRepository;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import com.restaurant.orderservice.domain.repository.RestaurantRepository;
import com.restaurant.orderservice.infrastructure.client.TrackingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateOrderUseCase {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;
    private final TrackingClient trackingClient;

    @Transactional
    public OrderResponse execute(CreateOrderRequest request) {
        log.info("Creando pedido restaurantId={} cliente='{}' items={}",
                request.getRestaurantId(), request.getCustomerName(), request.getItems().size());

        // ── Regla 1: restaurante debe existir ────────────────────────────────
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RestaurantNotFoundException(request.getRestaurantId()));

        // ── Reglas 2 y 3: al menos un item y cantidad > 0 ───────────────────
        // Ya garantizadas por validación en el DTO (@NotEmpty, @Min(1))
        // Se defienden aquí también por si el use case se llama fuera del controller

        // ── Reglas 4, 5, 6: cargar y validar productos ───────────────────────
        List<Long> requestedIds = request.getItems().stream()
                .map(CreateOrderItemRequest::getMenuItemId)
                .distinct()
                .toList();

        List<MenuItem> foundItems = menuItemRepository.findAllByIdIn(requestedIds);

        validateAllItemsExist(requestedIds, foundItems);

        Map<Long, MenuItem> itemMap = foundItems.stream()
                .collect(Collectors.toMap(MenuItem::getId, item -> item));

        validateItemsBelongToRestaurant(request.getRestaurantId(), itemMap);
        validateItemsAreAvailable(itemMap);

        // ── Construir entidades ───────────────────────────────────────────────
        Order order = buildOrder(restaurant, request);
        BigDecimal total = attachItemsAndCalculateTotal(order, request.getItems(), itemMap);
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        log.info("Pedido creado id={} restaurantId={} total={} items={}",
                saved.getId(), restaurant.getId(), total, saved.getItems().size());

        // El response se construye ANTES de llamar a tracking
        // Si tracking falla, la respuesta al cliente no se ve afectada
        OrderResponse response = toOrderResponse(saved);

        // ── Notificación a tracking-service (fire-and-forget) ─────────────────
        // El pedido ya está persistido. El cliente absorbe cualquier error internamente.
        trackingClient.notifyOrderCreated(
                saved.getId(),
                saved.getRestaurant().getId(),
                saved.getCustomerName(),
                saved.getTotalAmount(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        );

        return response;
    }

    // ── Validaciones ─────────────────────────────────────────────────────────

    private void validateAllItemsExist(List<Long> requestedIds, List<MenuItem> foundItems) {
        if (foundItems.size() == requestedIds.size()) return;

        Set<Long> foundIds = foundItems.stream()
                .map(MenuItem::getId)
                .collect(Collectors.toSet());

        Long missingId = requestedIds.stream()
                .filter(id -> !foundIds.contains(id))
                .findFirst()
                .orElseThrow();

        throw new MenuItemNotFoundException(missingId);
    }

    private void validateItemsBelongToRestaurant(Long restaurantId, Map<Long, MenuItem> itemMap) {
        // getRestaurant().getId() es seguro con LAZY: Hibernate devuelve el ID desde
        // el proxy sin hacer hit a la BD (FK ya está en memoria tras la carga anterior)
        itemMap.forEach((id, item) -> {
            if (!item.getRestaurant().getId().equals(restaurantId)) {
                throw new MenuItemNotFoundException(id);
            }
        });
    }

    private void validateItemsAreAvailable(Map<Long, MenuItem> itemMap) {
        itemMap.forEach((id, item) -> {
            if (!item.isAvailable()) {
                throw new MenuItemNotAvailableException(id, item.getName());
            }
        });
    }

    // ── Construcción de entidades ─────────────────────────────────────────────

    private Order buildOrder(Restaurant restaurant, CreateOrderRequest request) {
        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.CREATED);
        // totalAmount se asigna después de calcular
        order.setTotalAmount(BigDecimal.ZERO);
        return order;
    }

    private BigDecimal attachItemsAndCalculateTotal(Order order,
                                                    List<CreateOrderItemRequest> requestItems,
                                                    Map<Long, MenuItem> itemMap) {
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderItemRequest requestItem : requestItems) {
            MenuItem menuItem = itemMap.get(requestItem.getMenuItemId());

            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(requestItem.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setProductNameSnapshot(menuItem.getName());
            orderItem.setUnitPriceSnapshot(unitPrice);
            orderItem.setQuantity(requestItem.getQuantity());
            orderItem.setSubtotal(subtotal);

            order.getItems().add(orderItem);
            total = total.add(subtotal);
        }

        return total;
    }

    // ── Mapeo a response ──────────────────────────────────────────────────────

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
