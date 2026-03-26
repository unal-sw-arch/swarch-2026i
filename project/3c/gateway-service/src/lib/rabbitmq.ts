import amqp from "amqplib";
import { EventEmitter } from "events";
import { env } from "./env.js";

export interface PriceUpdate {
  name: string;
  slug: string;
  store: string;
  price: number;
  originalPrice: number;
  currency: string;
  url: string;
}

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Global event bus. SSE route handlers subscribe to this emitter.
 * Max listeners raised to accommodate many concurrent browser connections.
 */
export const priceUpdateBus = new EventEmitter();
priceUpdateBus.setMaxListeners(500);

/**
 * Start a durable RabbitMQ consumer that converts raw scrapper messages
 * into typed PriceUpdate events on `priceUpdateBus`.
 *
 * Automatically retries on connection failure (5 s back-off).
 */
export async function startConsumer(): Promise<void> {
  const url = `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;

  const connect = async () => {
    try {
      const conn = await amqp.connect(url);
      const channel = await conn.createChannel();
      await channel.assertQueue(env.RABBITMQ_QUEUE, { durable: true });

      channel.consume(
        env.RABBITMQ_QUEUE,
        (msg) => {
          if (!msg) return;
          try {
            const raw = JSON.parse(msg.content.toString()) as Record<
              string,
              unknown
            >;
            const update: PriceUpdate = {
              name: String(raw["name"] ?? ""),
              slug: nameToSlug(String(raw["name"] ?? "")),
              store: String(raw["store"] ?? ""),
              price: Number(raw["price_cents"] ?? 0) / 100,
              originalPrice: Number(raw["original_price_cents"] ?? 0) / 100,
              currency: String(raw["currency"] ?? "USD"),
              url: String(raw["url"] ?? ""),
            };
            priceUpdateBus.emit("price_update", update);
          } catch (err) {
            console.error("[rabbitmq] failed to parse message:", err);
          }
          channel.ack(msg);
        },
        { noAck: false },
      );

      conn.on("error", (err: Error) => {
        console.error("[rabbitmq] connection error:", err.message);
        setTimeout(connect, 5_000);
      });

      console.log(
        `[rabbitmq] consumer listening on queue: ${env.RABBITMQ_QUEUE}`,
      );
    } catch (err) {
      console.error("[rabbitmq] failed to connect, retrying in 5 s:", err);
      setTimeout(connect, 5_000);
    }
  };

  await connect();
}
