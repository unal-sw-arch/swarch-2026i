import amqp from "amqplib";
import { processNotificationQueue } from "../services/notification.service.js";

const RABBITMQ_USER = process.env.RABBITMQ_USER || "guest";
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || "guest";
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || "localhost";
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || "5672";

const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
const NOTIFICATION_QUEUE =
  process.env.NOTIFICATION_QUEUE || "notification_queue";

let channel: amqp.Channel | null = null;

export async function initRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();

    await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

    channel.consume(NOTIFICATION_QUEUE, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processNotificationQueue(data);
        } catch (err) {
          console.error("[rabbitmq] Error processing message", err);
        }
        channel?.ack(msg);
      }
    });

    console.log(
      `[rabbitmq] Initialized, listening to ${NOTIFICATION_QUEUE} queue.`,
    );
  } catch (error) {
    console.error("[rabbitmq] Failed to connect, retrying in 5s...", error);
    setTimeout(initRabbitMQ, 5000);
  }
}
