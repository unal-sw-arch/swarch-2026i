/**
 * Typed, validated environment configuration.
 * Throws at startup if a required variable is missing, so misconfiguration
 * surfaces immediately rather than at the first proxied request.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env["PORT"] ?? "8080", 10),
  USER_SERVICE_URL: requireEnv("USER_SERVICE_URL"),
  SCRAPPER_SERVICE_URL: requireEnv("SCRAPPER_SERVICE_URL"),
  // Redis — defaults to localhost for local dev
  REDIS_URL: process.env["REDIS_URL"] ?? "redis://localhost:6379",
  // RabbitMQ — defaults to local guest credentials
  RABBITMQ_HOST: process.env["RABBITMQ_HOST"] ?? "localhost",
  RABBITMQ_PORT: parseInt(process.env["RABBITMQ_PORT"] ?? "5672", 10),
  RABBITMQ_USER: process.env["RABBITMQ_USER"] ?? "guest",
  RABBITMQ_PASSWORD: process.env["RABBITMQ_PASSWORD"] ?? "guest",
  RABBITMQ_QUEUE: process.env["RABBITMQ_QUEUE"] ?? "game_prices_queue",
} as const;

export type Env = typeof env;
