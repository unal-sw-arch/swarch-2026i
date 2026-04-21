package messaging

import (
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

	"github.com/arquisoft/kitchen-service/domain"
	"github.com/arquisoft/kitchen-service/store"
)

const (
	exchange   = "deliunal.events"
	queueName  = "kitchen-service.order-created"
	bindingKey = "order.created"
)

// OrderCreatedEvent is the schema of the ORDER_CREATED message published by the Order Service.
type OrderCreatedEvent struct {
	EventType    string          `json:"eventType"`
	EntityID     string          `json:"entityId"`
	RestaurantID string          `json:"restaurantId"`
	OrderID      string          `json:"orderId"`
	CustomerName string          `json:"customerName"`
	TotalAmount  float64         `json:"totalAmount"`
	Notes        string          `json:"notes"`
	Status       string          `json:"status"`
	Timestamp    string          `json:"timestamp"`
	Items        []domain.OrderItem `json:"items"`
}

// Consumer listens for ORDER_CREATED events and enqueues them in the kitchen store.
type Consumer struct {
	amqpURL string
	store   *store.MemoryStore
}

// NewConsumer creates a Consumer ready to be started.
func NewConsumer(amqpURL string, s *store.MemoryStore) *Consumer {
	return &Consumer{amqpURL: amqpURL, store: s}
}

// Start begins consuming in a blocking loop; reconnects automatically on failure.
// Should be run in its own goroutine.
func (c *Consumer) Start() {
	for {
		if err := c.consume(); err != nil {
			log.Printf("[Kitchen Consumer] Disconnected: %v. Retrying in 5s…", err)
			time.Sleep(5 * time.Second)
		}
	}
}

func (c *Consumer) consume() error {
	conn, err := amqp.Dial(c.amqpURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	// Ensure the shared topic exchange exists.
	if err := ch.ExchangeDeclare(exchange, "topic", true, false, false, false, nil); err != nil {
		return err
	}

	// Durable queue — survives broker restart.
	q, err := ch.QueueDeclare(queueName, true, false, false, false, nil)
	if err != nil {
		return err
	}

	if err := ch.QueueBind(q.Name, bindingKey, exchange, false, nil); err != nil {
		return err
	}

	// Prefetch 1 — process one message at a time for ordering guarantees.
	if err := ch.Qos(1, 0, false); err != nil {
		return err
	}

	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		return err
	}

	log.Printf("[Kitchen Consumer] Connected. Waiting for ORDER_CREATED events…")

	for msg := range msgs {
		c.handleMessage(msg)
	}

	return nil
}

func (c *Consumer) handleMessage(msg amqp.Delivery) {
	var event OrderCreatedEvent
	if err := json.Unmarshal(msg.Body, &event); err != nil {
		log.Printf("[Kitchen Consumer] Failed to parse message: %v", err)
		msg.Nack(false, false) // discard malformed messages
		return
	}

	// Use orderId field; fall back to entityId.
	orderID := event.OrderID
	if orderID == "" {
		orderID = event.EntityID
	}

	createdAt := time.Now().UTC()
	if event.Timestamp != "" {
		if t, err := time.Parse(time.RFC3339, event.Timestamp); err == nil {
			createdAt = t
		}
	}

	order := &domain.KitchenOrder{
		ID:           orderID,
		RestaurantID: event.RestaurantID,
		CustomerName: event.CustomerName,
		TotalAmount:  event.TotalAmount,
		Notes:        event.Notes,
		Status:       domain.StatusCreated,
		Items:        event.Items,
		CreatedAt:    createdAt,
		UpdatedAt:    createdAt,
	}

	c.store.Add(order)
	log.Printf("[Kitchen Consumer] Enqueued order %s for restaurant %s", orderID, event.RestaurantID)

	msg.Ack(false)
}
