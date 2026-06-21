package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	// ContextKeyRestaurantID is the key used to store the restaurant_id claim in the request context.
	ContextKeyRestaurantID contextKey = "restaurant_id"
	// ContextKeyUserID stores the subject (user ID) from the token.
	ContextKeyUserID contextKey = "user_id"
)

// errorResponse writes a unified error body to match the Biblia format.
func errorResponse(w http.ResponseWriter, code string, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"code":    code,
		"message": message,
	})
}

// JWTAuth validates the Authorization Bearer token and injects claims into the request context.
// It uses the same JWT_SECRET shared across the ecosystem (issued by Auth Service L2).
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				errorResponse(w, "UNAUTHORIZED", "Token required or invalid", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				errorResponse(w, "UNAUTHORIZED", "Token required or invalid", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				errorResponse(w, "UNAUTHORIZED", "Token required or invalid", http.StatusUnauthorized)
				return
			}

			// Inject claims into context — the handler will use restaurant_id to enforce ownership.
			ctx := r.Context()

			if restaurantID, ok := claims["restaurantId"]; ok {
				ctx = context.WithValue(ctx, ContextKeyRestaurantID, fmt.Sprintf("%v", restaurantID))
			} else if restaurantID, ok := claims["restaurant_id"]; ok {
				ctx = context.WithValue(ctx, ContextKeyRestaurantID, fmt.Sprintf("%v", restaurantID))
			}
			if sub, ok := claims["sub"]; ok {
				ctx = context.WithValue(ctx, ContextKeyUserID, fmt.Sprintf("%v", sub))
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetRestaurantID extracts the restaurant_id from the request context (set by JWTAuth middleware).
func GetRestaurantID(ctx context.Context) string {
	if v, ok := ctx.Value(ContextKeyRestaurantID).(string); ok {
		return v
	}
	return ""
}
