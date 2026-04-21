package domain

import "time"

// KitchenOrderStatus represents the operational state of an order in the kitchen.
type KitchenOrderStatus string

const (
	StatusCreated       KitchenOrderStatus = "CREATED"
	StatusInPreparation KitchenOrderStatus = "IN_PREPARATION"
	StatusReady         KitchenOrderStatus = "READY"
	StatusDelivered     KitchenOrderStatus = "DELIVERED"
	StatusCancelled     KitchenOrderStatus = "CANCELLED"
)

// OrderItem is a snapshot of a single product line within an order.
type OrderItem struct {
	MenuItemID  string  `json:"menuItemId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	Subtotal    float64 `json:"subtotal"`
}

// KitchenOrder is the kitchen-facing representation of a customer order.
type KitchenOrder struct {
	ID           string             `json:"id"`
	RestaurantID string             `json:"restaurantId"`
	CustomerName string             `json:"customerName"`
	TotalAmount  float64            `json:"totalAmount"`
	Notes        string             `json:"notes,omitempty"`
	Status       KitchenOrderStatus `json:"status"`
	Items        []OrderItem        `json:"items"`
	CreatedAt    time.Time          `json:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt"`
}
