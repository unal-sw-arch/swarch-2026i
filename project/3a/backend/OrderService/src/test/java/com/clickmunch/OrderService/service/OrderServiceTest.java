package com.clickmunch.OrderService.service;

import com.clickmunch.OrderService.dto.*;
import com.clickmunch.OrderService.entity.Order;
import com.clickmunch.OrderService.entity.OrderItem;
import com.clickmunch.OrderService.entity.OrderStatus;
import com.clickmunch.OrderService.realtime.KitchenEventsPublisher;
import com.clickmunch.OrderService.repository.OrderItemRepository;
import com.clickmunch.OrderService.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private KitchenEventsPublisher events;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private OrderItem testItem;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(1L);
        testOrder.setRestaurantId(10L);
        testOrder.setTableNumber(5);
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setNotes("No onions");
        testOrder.setCreatedAt(LocalDateTime.now());
        testOrder.setUpdatedAt(LocalDateTime.now());

        testItem = new OrderItem();
        testItem.setId(1L);
        testItem.setOrderId(1L);
        testItem.setItemName("Burger");
        testItem.setNotes("Well done");
    }

    @Test
    void createOrder_insertsOneRowPerUnit_withPerUnitNotes() {
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderItem noLettuce = new OrderItem();
        noLettuce.setId(1L);
        noLettuce.setOrderId(1L);
        noLettuce.setItemName("Burger");
        noLettuce.setNotes("sin lechuga");
        OrderItem full = new OrderItem();
        full.setId(2L);
        full.setOrderId(1L);
        full.setItemName("Burger");
        full.setNotes("con todo");
        when(orderItemRepository.saveAll(anyList())).thenReturn(List.of(noLettuce, full));

        CreateOrderRequest request = new CreateOrderRequest(
                10L, 5, "Table 5",
                List.of(
                        new CreateOrderItemRequest("Burger", "sin lechuga"),
                        new CreateOrderItemRequest("Burger", "con todo")
                )
        );

        ApiResponse<OrderResponse> response = orderService.createOrder(request);

        assertNotNull(response.data());
        assertEquals("Order created successfully", response.message());
        assertEquals(2, response.data().items().size());
        assertEquals("sin lechuga", response.data().items().get(0).notes());
        assertEquals("con todo", response.data().items().get(1).notes());
        verify(orderItemRepository).saveAll(anyList());
    }

    @Test
    void getOrder_withValidId_returnsOrder() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        ApiResponse<OrderResponse> response = orderService.getOrder(1L);

        assertNotNull(response.data());
        assertEquals(1L, response.data().id());
        assertEquals("Burger", response.data().items().getFirst().itemName());
    }

    @Test
    void getOrder_withInvalidId_throwsException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrder(999L));
    }

    @Test
    void getKitchenOrders_returnsActiveOrders() {
        when(orderRepository.findActiveByRestaurantId(10L)).thenReturn(List.of(testOrder));
        when(orderItemRepository.findByOrderIdIn(List.of(1L))).thenReturn(List.of(testItem));

        ApiResponse<List<OrderResponse>> response = orderService.getKitchenOrders(10L);

        assertEquals(1, response.data().size());
        assertEquals("PENDING", response.data().getFirst().status());
    }

    @Test
    void getKitchenOrders_withNoOrders_returnsEmptyList() {
        when(orderRepository.findActiveByRestaurantId(999L)).thenReturn(List.of());

        ApiResponse<List<OrderResponse>> response = orderService.getKitchenOrders(999L);

        assertTrue(response.data().isEmpty());
    }

    @Test
    void getRestaurantOrders_withStatusFilter_returnsFiltered() {
        when(orderRepository.findByRestaurantIdAndStatus(10L, "PENDING")).thenReturn(List.of(testOrder));
        when(orderItemRepository.findByOrderIdIn(List.of(1L))).thenReturn(List.of(testItem));

        ApiResponse<List<OrderResponse>> response = orderService.getRestaurantOrders(10L, "PENDING");

        assertEquals(1, response.data().size());
    }

    @Test
    void getRestaurantOrders_withoutFilter_returnsAll() {
        when(orderRepository.findByRestaurantId(10L)).thenReturn(List.of(testOrder));
        when(orderItemRepository.findByOrderIdIn(List.of(1L))).thenReturn(List.of(testItem));

        ApiResponse<List<OrderResponse>> response = orderService.getRestaurantOrders(10L, null);

        assertEquals(1, response.data().size());
    }

    @Test
    void updateStatus_validTransition_pendingToInPreparation() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        ApiResponse<OrderResponse> response = orderService.updateStatus(1L, new UpdateStatusRequest("IN_PREPARATION"));

        assertEquals("IN_PREPARATION", response.data().status());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updateStatus_validTransition_inPreparationToReady() {
        testOrder.setStatus(OrderStatus.IN_PREPARATION);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        ApiResponse<OrderResponse> response = orderService.updateStatus(1L, new UpdateStatusRequest("READY"));

        assertEquals("READY", response.data().status());
    }

    @Test
    void updateStatus_validTransition_readyToDelivered() {
        testOrder.setStatus(OrderStatus.READY);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        ApiResponse<OrderResponse> response = orderService.updateStatus(1L, new UpdateStatusRequest("DELIVERED"));

        assertEquals("DELIVERED", response.data().status());
    }

    @Test
    void updateStatus_validTransition_pendingToCancelled() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        ApiResponse<OrderResponse> response = orderService.updateStatus(1L, new UpdateStatusRequest("CANCELLED"));

        assertEquals("CANCELLED", response.data().status());
    }

    @Test
    void updateStatus_invalidTransition_pendingToReady_throws() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, new UpdateStatusRequest("READY")));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateStatus_invalidTransition_deliveredToAnything_throws() {
        testOrder.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, new UpdateStatusRequest("PENDING")));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateStatus_invalidTransition_cancelledToAnything_throws() {
        testOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, new UpdateStatusRequest("PENDING")));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void updateStatus_invalidStatusString_throws() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, new UpdateStatusRequest("NONEXISTENT")));
    }

    @Test
    void updateStatus_orderNotFound_throws() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(999L, new UpdateStatusRequest("IN_PREPARATION")));
    }

    @Test
    void createOrder_publishesCreatedEvent() {
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });
        when(orderItemRepository.saveAll(anyList())).thenReturn(List.of(testItem));

        CreateOrderRequest request = new CreateOrderRequest(
                10L, 5, null,
                List.of(new CreateOrderItemRequest("Burger", null))
        );

        orderService.createOrder(request);

        verify(events, times(1)).publishCreated(any(OrderResponse.class));
        verify(events, never()).publishStatusChanged(any());
    }

    @Test
    void updateStatus_publishesStatusChangedEvent() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(testItem));

        orderService.updateStatus(1L, new UpdateStatusRequest("IN_PREPARATION"));

        verify(events, times(1)).publishStatusChanged(any(OrderResponse.class));
    }

    @Test
    void updateStatus_invalidTransition_doesNotPublish() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class,
                () -> orderService.updateStatus(1L, new UpdateStatusRequest("READY")));
        verify(events, never()).publishStatusChanged(any());
    }
}
