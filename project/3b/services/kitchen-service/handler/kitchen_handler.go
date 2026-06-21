package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/arquisoft/kitchen-service/domain"
	"github.com/arquisoft/kitchen-service/messaging"
	"github.com/arquisoft/kitchen-service/middleware"
	"github.com/arquisoft/kitchen-service/store"
)

// updateStatusRequest is the body for PATCH /kitchen/orders/{id}/status.
type updateStatusRequest struct {
	Status string `json:"status"`
}

// KitchenHandler groups all HTTP handlers for the kitchen API.
type KitchenHandler struct {
	store     *store.MemoryStore
	publisher *messaging.Publisher
}

// NewKitchenHandler creates a KitchenHandler.
func NewKitchenHandler(s *store.MemoryStore, pub *messaging.Publisher) *KitchenHandler {
	return &KitchenHandler{store: s, publisher: pub}
}

// jsonError writes a unified error body following the Biblia error contract.
func jsonError(w http.ResponseWriter, code, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"code":    code,
		"message": message,
	})
}

// ListOrders handles GET /kitchen/orders
// Returns all orders in the kitchen queue for the authenticated restaurant.
func (h *KitchenHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	restaurantID := middleware.GetRestaurantID(r.Context())
	if restaurantID == "" {
		jsonError(w, "FORBIDDEN", "Restaurant identity could not be determined from token", http.StatusForbidden)
		return
	}

	orders := h.store.GetAll(restaurantID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(orders)
}

// UpdateStatus handles PATCH /kitchen/orders/{id}/status
// Validates transition, updates the store, and publishes the corresponding events.
func (h *KitchenHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	restaurantID := middleware.GetRestaurantID(r.Context())
	if restaurantID == "" {
		jsonError(w, "FORBIDDEN", "Restaurant identity could not be determined from token", http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	orderID := vars["id"]

	// ── Parse request body ────────────────────────────────────────────────────
	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Status == "" {
		jsonError(w, "VALIDATION_ERROR", "Request body must contain a valid 'status' field", http.StatusBadRequest)
		return
	}

	// ── Resolve target status ─────────────────────────────────────────────────
	newStatus, err := domain.ParseStatus(req.Status)
	if err != nil {
		jsonError(w, "VALIDATION_ERROR", "Unknown status: "+req.Status, http.StatusBadRequest)
		return
	}

	// ── Retrieve existing order ───────────────────────────────────────────────
	order, err := h.store.GetByID(orderID)
	if err != nil {
		jsonError(w, "ORDER_NOT_FOUND", "Order not found: "+orderID, http.StatusNotFound)
		return
	}

	// ── Ownership check — only the owning restaurant may change order state ───
	if order.RestaurantID != restaurantID {
		jsonError(w, "FORBIDDEN", "You do not have permission to modify this order", http.StatusForbidden)
		return
	}

	// ── State machine validation ──────────────────────────────────────────────
	oldStatus := order.Status
	if err := domain.ValidateTransition(oldStatus, newStatus); err != nil {
		var te *domain.ErrInvalidTransition
		if errors.As(err, &te) {
			jsonError(w, "INVALID_STATUS_TRANSITION",
				"Cannot transition from "+string(oldStatus)+" to "+string(newStatus),
				http.StatusUnprocessableEntity)
			return
		}
		jsonError(w, "INVALID_STATUS_TRANSITION", err.Error(), http.StatusUnprocessableEntity)
		return
	}

	// ── Apply the update ──────────────────────────────────────────────────────
	updated, err := h.store.UpdateStatus(orderID, newStatus)
	if err != nil {
		jsonError(w, "INTERNAL_ERROR", "Could not update order status", http.StatusInternalServerError)
		return
	}
	updated.UpdatedAt = time.Now().UTC()

	// ── Publish events (fire-and-forget) ──────────────────────────────────────
	go h.publisher.PublishStatusChanged(orderID, restaurantID, string(oldStatus), string(newStatus))
	if newStatus == domain.StatusReady {
		go h.publisher.PublishOrderReady(orderID, restaurantID)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updated)
}
