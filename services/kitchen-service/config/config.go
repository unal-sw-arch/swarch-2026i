package config

import "os"

// Config holds all environment-driven configuration for the Kitchen Service.
type Config struct {
	Port      string
	AMQPUrl   string
	JWTSecret string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "8082"),
		AMQPUrl:   getEnv("AMQP_URL", "amqp://guest:guest@event-broker:5672"),
		JWTSecret: getEnv("JWT_SECRET", "super-secret-key-for-development"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
