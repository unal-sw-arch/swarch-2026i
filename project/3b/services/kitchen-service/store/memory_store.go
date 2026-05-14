package store

import (
	"fmt"
	"sync"

	"github.com/arquisoft/kitchen-service/domain"
)

// MemoryStore is a thread-safe in-memory repository for KitchenOrders.
type MemoryStore struct {
	mu     sync.RWMutex
	orders map[string]*domain.KitchenOrder
}

// NewMemoryStore creates an initialised MemoryStore.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		orders: make(map[string]*domain.KitchenOrder),
	}
}

// Add inserts a new order; it is a no-op if the order already exists (idempotent consumer).
func (ms *MemoryStore) Add(order *domain.KitchenOrder) {
	ms.mu.Lock()
	defer ms.mu.Unlock()
	if _, exists := ms.orders[order.ID]; !exists {
		ms.orders[order.ID] = order
	}
}

// GetAll returns all orders whose RestaurantID matches the given filter.
func (ms *MemoryStore) GetAll(restaurantID string) []*domain.KitchenOrder {
	ms.mu.RLock()
	defer ms.mu.RUnlock()

	result := make([]*domain.KitchenOrder, 0)
	for _, o := range ms.orders {
		if o.RestaurantID == restaurantID {
			result = append(result, o)
		}
	}
	return result
}

// GetByID retrieves a single order by its ID.
func (ms *MemoryStore) GetByID(id string) (*domain.KitchenOrder, error) {
	ms.mu.RLock()
	defer ms.mu.RUnlock()

	o, ok := ms.orders[id]
	if !ok {
		return nil, fmt.Errorf("order %s not found", id)
	}
	return o, nil
}

// UpdateStatus applies the new status to an existing order (caller must have already validated transition).
func (ms *MemoryStore) UpdateStatus(id string, newStatus domain.KitchenOrderStatus) (*domain.KitchenOrder, error) {
	ms.mu.Lock()
	defer ms.mu.Unlock()

	o, ok := ms.orders[id]
	if !ok {
		return nil, fmt.Errorf("order %s not found", id)
	}
	o.Status = newStatus
	return o, nil
}
