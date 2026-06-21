package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/arquisoft/kitchen-service/config"
	"github.com/arquisoft/kitchen-service/handler"
	"github.com/arquisoft/kitchen-service/messaging"
	"github.com/arquisoft/kitchen-service/middleware"
	"github.com/arquisoft/kitchen-service/store"
)

func main() {
	cfg := config.Load()
	log.Printf("[Kitchen Service L5] Starting on port %s", cfg.Port)

	// ── Shared in-memory store (thread-safe kitchen queue) ────────────────────
	kitchenStore := store.NewMemoryStore()

	// ── RabbitMQ Publisher ────────────────────────────────────────────────────
	// Retry until the broker is ready (important during docker-compose startup).
	var publisher *messaging.Publisher
	for i := 0; i < 10; i++ {
		var err error
		publisher, err = messaging.NewPublisher(cfg.AMQPUrl)
		if err == nil {
			break
		}
		log.Printf("[Kitchen Publisher] Could not connect (attempt %d/10): %v. Retrying in 3s…", i+1, err)
		time.Sleep(3 * time.Second)
	}
	if publisher == nil {
		log.Fatal("[Kitchen Publisher] Failed to connect to RabbitMQ after 10 attempts")
	}
	defer publisher.Close()

	// ── RabbitMQ Consumer (runs in background goroutine) ─────────────────────
	consumer := messaging.NewConsumer(cfg.AMQPUrl, kitchenStore)
	go consumer.Start()

	// ── HTTP Router ───────────────────────────────────────────────────────────
	kitchenHandler := handler.NewKitchenHandler(kitchenStore, publisher)
	authMiddleware := middleware.JWTAuth(cfg.JWTSecret)

	r := mux.NewRouter()

	// Apply JWT auth to all /kitchen routes.
	api := r.PathPrefix("/kitchen").Subrouter()
	api.Use(authMiddleware)
	api.HandleFunc("/orders", kitchenHandler.ListOrders).Methods(http.MethodGet)
	api.HandleFunc("/orders/{id}/status", kitchenHandler.UpdateStatus).Methods(http.MethodPatch)

	// Health-check (no auth required)
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"kitchen-service"}`))
	}).Methods(http.MethodGet)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("[Kitchen Service L5] Listening on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("[Kitchen Service L5] Server error: %v", err)
	}
}
