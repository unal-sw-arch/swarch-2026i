package messaging

import (
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Publisher publishes kitchen state-change events to the shared RabbitMQ topic exchange.
type Publisher struct {
	amqpURL string
	conn    *amqp.Connection
	ch      *amqp.Channel
}

// NewPublisher creates a Publisher and establishes the initial connection.
func NewPublisher(amqpURL string) (*Publisher, error) {
	p := &Publisher{amqpURL: amqpURL}
	if err := p.connect(); err != nil {
		return nil, err
	}
	return p, nil
}

func (p *Publisher) connect() error {
	conn, err := amqp.Dial(p.amqpURL)
	if err != nil {
		return err
	}
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return err
	}
	// Ensure the shared topic exchange exists.
	if err := ch.ExchangeDeclare(exchange, "topic", true, false, false, false, nil); err != nil {
		ch.Close()
		conn.Close()
		return err
	}
	p.conn = conn
	p.ch = ch
	log.Printf("[Kitchen Publisher] Connected to RabbitMQ at %s", p.amqpURL)
	return nil
}

// PublishStatusChanged publishes an ORDER_STATUS_CHANGED event.
func (p *Publisher) PublishStatusChanged(orderID, restaurantID, oldStatus, newStatus string) {
	p.publish("order.status.changed", "ORDER_STATUS_CHANGED", map[string]interface{}{
		"orderId":       orderID,
		"restaurantId":  restaurantID,
		"previousStatus": oldStatus,
		"newStatus":     newStatus,
	})
}

// PublishOrderReady publishes an ORDER_READY event when the status transitions to READY.
func (p *Publisher) PublishOrderReady(orderID, restaurantID string) {
	p.publish("order.ready", "ORDER_READY", map[string]interface{}{
		"orderId":      orderID,
		"restaurantId": restaurantID,
	})
}

func (p *Publisher) publish(routingKey, eventType string, data map[string]interface{}) {
	// Reconnect if the channel was lost.
	if p.ch == nil || p.conn == nil || p.conn.IsClosed() {
		log.Printf("[Kitchen Publisher] Reconnecting before publishing %s…", eventType)
		if err := p.connect(); err != nil {
			log.Printf("[Kitchen Publisher] Reconnect failed: %v", err)
			return
		}
	}

	payload := make(map[string]interface{})
	for k, v := range data {
		payload[k] = v
	}
	payload["eventType"] = eventType
	payload["timestamp"] = time.Now().UTC().Format(time.RFC3339)
	payload["sourceService"] = "kitchen-service"

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[Kitchen Publisher] Failed to marshal %s: %v", eventType, err)
		return
	}

	if err := p.ch.Publish(exchange, routingKey, false, false, amqp.Publishing{
		ContentType:  "application/json",
		DeliveryMode: amqp.Persistent,
		Body:         body,
	}); err != nil {
		log.Printf("[Kitchen Publisher] Failed to publish %s: %v", eventType, err)
		p.ch = nil // Force reconnect on next call
		return
	}

	log.Printf("[Kitchen Publisher] Published %s → key=%s orderId=%v", eventType, routingKey, data["orderId"])
}

// Close gracefully shuts down the publisher connection.
func (p *Publisher) Close() {
	if p.ch != nil {
		p.ch.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
}
