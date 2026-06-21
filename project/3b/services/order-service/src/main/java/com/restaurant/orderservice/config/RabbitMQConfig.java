package com.restaurant.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Fase 1: skeleton de config RabbitMQ.
 * Exchange y routing keys externalizados en application.properties.
 * El publisher concreto (RabbitMQOrderEventPublisher) se implementa en Fase 6.
 */
@Configuration
@Profile("!local")
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.routing-key.order-created}")
    private String rkOrderCreated;

    @Value("${app.rabbitmq.routing-key.order-status-changed}")
    private String rkOrderStatusChanged;

    @Bean
    public TopicExchange orderExchange() {
        return ExchangeBuilder
            .topicExchange(exchangeName)
            .durable(true)
            .build();
    }

    // Serialización de mensajes como JSON — alineado con el contrato async
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
