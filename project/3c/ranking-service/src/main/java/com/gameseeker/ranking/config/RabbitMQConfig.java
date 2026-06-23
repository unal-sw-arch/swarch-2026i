package com.gameseeker.ranking.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ topology for the Active Redundancy (Hot Spare) pattern.
 *
 * <p>Price events are published to a <b>fanout exchange</b> rather than a single
 * shared queue. Each ranking instance (active and spare) declares its <b>own</b>
 * queue and binds it to the exchange, so a fanout delivers <b>every</b> message
 * to <b>every</b> instance. Both the active and the hot spare therefore process
 * identical inputs in parallel and keep their leaderboards fully synchronized —
 * the defining property of a hot spare.
 *
 * <p>Contrast with the previous single-queue design, where the two instances
 * would have been <i>competing consumers</i> (each message delivered to only one
 * of them), which is load-sharing, not redundancy.
 *
 * <p>The per-instance queue is non-durable and auto-delete: while an instance is
 * down its queue disappears (no message pile-up), and it re-binds fresh on
 * restart. Durable state lives in Redis, shared by both instances.
 */
@Configuration
public class RabbitMQConfig {

    @Value("${ranking.exchange.name}")
    private String exchangeName;

    @Value("${ranking.instance.queue}")
    private String instanceQueueName;

    @Bean
    public FanoutExchange rankingExchange() {
        // durable exchange, not auto-deleted — survives instance restarts.
        return new FanoutExchange(exchangeName, true, false);
    }

    @Bean
    public Queue rankingInstanceQueue() {
        // durable=false, exclusive=false, autoDelete=true
        return new Queue(instanceQueueName, false, false, true);
    }

    @Bean
    public Binding rankingBinding() {
        return BindingBuilder.bind(rankingInstanceQueue()).to(rankingExchange());
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
