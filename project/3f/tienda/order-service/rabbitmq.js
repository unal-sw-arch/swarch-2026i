const amqp = require("amqplib");

const URL = process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672";
const EXCHANGE = "orders.exchange";
const EXCHANGE_TYPE = "direct";
const RECONNECT_MS = 5000;

let connection = null;
let channel = null;
let connecting = null;

async function connect() {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      connection = await amqp.connect(URL);

      connection.on("error", (err) => {
        console.error("⚠️  RabbitMQ connection error:", err.message);
      });

      connection.on("close", () => {
        console.warn("⚠️  RabbitMQ connection closed. Reintentando en 5s...");
        connection = null;
        channel = null;
        setTimeout(() => {
          connect().catch(() => {});
        }, RECONNECT_MS);
      });

      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      console.log("✅ Conectado a RabbitMQ (exchange:", EXCHANGE + ")");
      return channel;
    } catch (err) {
      console.error("❌ No se pudo conectar a RabbitMQ:", err.message);
      connection = null;
      channel = null;
      setTimeout(() => {
        connect().catch(() => {});
      }, RECONNECT_MS);
      throw err;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

async function publishOrderCreated(event) {
  try {
    const ch = await connect();
    const routingKey = "order.created";
    const ok = ch.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: String(event.orderId),
        timestamp: Date.now(),
      }
    );
    if (!ok) console.warn("⚠️  Buffer de RabbitMQ lleno");
    console.log(`📤 Evento order.created publicado (orderId=${event.orderId})`);
    return ok;
  } catch (err) {
    console.error("❌ Error publicando evento:", err.message);
    return false;
  }
}

module.exports = { connect, publishOrderCreated, EXCHANGE };
