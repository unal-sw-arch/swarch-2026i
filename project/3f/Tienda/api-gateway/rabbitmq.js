const amqp = require("amqplib");

const URL = process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672";
const EXCHANGE = "auth.exchange";
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
        console.error("⚠️  RabbitMQ (gateway) error:", err.message);
      });

      connection.on("close", () => {
        console.warn("⚠️  RabbitMQ (gateway) cerrado. Reintentando en 5s...");
        connection = null;
        channel = null;
        setTimeout(() => connect().catch(() => {}), RECONNECT_MS);
      });

      channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
      console.log("✅ Gateway conectado a RabbitMQ (exchange:", EXCHANGE + ")");
      return channel;
    } catch (err) {
      console.error("❌ Gateway no pudo conectar a RabbitMQ:", err.message);
      connection = null;
      channel = null;
      setTimeout(() => connect().catch(() => {}), RECONNECT_MS);
      throw err;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

async function publishVerificationRequested(event) {
  try {
    const ch = await connect();
    const routingKey = "auth.verification.requested";
    const ok = ch.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: `verif-${event.userId}-${Date.now()}`,
        timestamp: Date.now(),
      }
    );
    console.log(`📤 Evento auth.verification.requested publicado (userId=${event.userId})`);
    return ok;
  } catch (err) {
    console.error("❌ Error publicando verification:", err.message);
    return false;
  }
}

module.exports = { connect, publishVerificationRequested, EXCHANGE };
