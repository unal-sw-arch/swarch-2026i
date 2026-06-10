package com.clickmunch.NotificationService.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "clickmunch.events";

    public static final String ORDER_QUEUE = "notification.order.queue";
    public static final String RESERVATION_QUEUE = "notification.reservation.queue";

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // ─── Order events queue ───

    @Bean
    public Queue orderQueue() {
        return new Queue(ORDER_QUEUE, true);
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderQueue).to(eventExchange).with("order.created");
    }

    @Bean
    public Binding orderStatusChangedBinding(Queue orderQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(orderQueue).to(eventExchange).with("order.status.changed");
    }

    // ─── Reservation events queue ───

    @Bean
    public Queue reservationQueue() {
        return new Queue(RESERVATION_QUEUE, true);
    }

    @Bean
    public Binding reservationConfirmedBinding(Queue reservationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(reservationQueue).to(eventExchange).with("reservation.confirmed");
    }

    @Bean
    public Binding reservationCancelledBinding(Queue reservationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(reservationQueue).to(eventExchange).with("reservation.cancelled");
    }

    // ─── JSON message converter ───

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
