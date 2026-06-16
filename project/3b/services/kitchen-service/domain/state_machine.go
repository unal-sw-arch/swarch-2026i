package domain

import (
	"fmt"
	"strings"
)

// allowedTransitions defines the valid state machine for kitchen orders.
// Biblia técnica — Reglas de Transición Obligatorias:
//   CREATED → IN_PREPARATION → READY → DELIVERED
//   CREATED → CANCELLED
//   IN_PREPARATION → CANCELLED
var allowedTransitions = map[KitchenOrderStatus][]KitchenOrderStatus{
	StatusCreated:       {StatusInPreparation, StatusCancelled},
	StatusInPreparation: {StatusReady, StatusCancelled},
	StatusReady:         {StatusDelivered},
	StatusDelivered:     {},
	StatusCancelled:     {},
}

// ErrInvalidTransition is returned when a requested state change is not allowed.
type ErrInvalidTransition struct {
	From KitchenOrderStatus
	To   KitchenOrderStatus
}

func (e *ErrInvalidTransition) Error() string {
	return fmt.Sprintf("invalid transition from %s to %s", e.From, e.To)
}

// ValidateTransition checks whether a transition from `from` to `to` is permitted.
func ValidateTransition(from, to KitchenOrderStatus) error {
	allowed, ok := allowedTransitions[from]
	if !ok {
		return &ErrInvalidTransition{From: from, To: to}
	}
	for _, s := range allowed {
		if s == to {
			return nil
		}
	}
	return &ErrInvalidTransition{From: from, To: to}
}

// ParseStatus converts a raw string into a KitchenOrderStatus, validating the value.
func ParseStatus(raw string) (KitchenOrderStatus, error) {
	s := KitchenOrderStatus(strings.ToUpper(raw))
	switch s {
	case StatusCreated, StatusInPreparation, StatusReady, StatusDelivered, StatusCancelled:
		return s, nil
	default:
		return "", fmt.Errorf("unknown status: %s", raw)
	}
}
