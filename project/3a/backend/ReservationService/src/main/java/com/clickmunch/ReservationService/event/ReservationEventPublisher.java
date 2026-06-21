package com.clickmunch.ReservationService.event;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.clickmunch.ReservationService.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishReservationConfirmed(ReservationEvent event) {
        log.info("Publishing reservation.confirmed event for reservation {}", event.reservationId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "reservation.confirmed", event);
    }

    public void publishReservationCancelled(ReservationEvent event) {
        log.info("Publishing reservation.cancelled event for reservation {}", event.reservationId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "reservation.cancelled", event);
    }
}
