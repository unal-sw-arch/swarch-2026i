const amqp = require("amqplib");
const { createClient } = require("redis");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://admin:admin@rabbitmq:5672";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

// ── Suscripciones (un consumer por evento) ─────────────
const ORDERS_EXCHANGE = "orders.exchange";
const ORDERS_QUEUE = "orders.notifications.queue";
const ORDERS_ROUTING_KEY = "order.created";

const AUTH_EXCHANGE = "auth.exchange";
const AUTH_QUEUE = "auth.email.queue";
const AUTH_ROUTING_KEY = "auth.verification.requested";

const DEDUP_TTL_SECONDS = 60 * 60 * 24; // 24 horas

// ── SMTP (opcional; si no hay credenciales, cae a console.log) ─
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const mailer = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

if (mailer) {
  console.log(`✉️  SMTP activo (${SMTP_HOST}:${SMTP_PORT}, from ${SMTP_FROM})`);
} else {
  console.log("ℹ️  SMTP no configurado: los correos se imprimirán en consola.");
}

// ── Cliente Redis ──────────────────────────────────────
const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", err => console.error("Redis error:", err));

async function connectRedis() {
  let connected = false;
  while (!connected) {
    try {
      await redisClient.connect();
      connected = true;
      console.log("✅ Conectado a Redis");
    } catch (err) {
      console.log("⏳ Esperando Redis...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ── Handlers ───────────────────────────────────────────
async function handleOrderCreated(data) {
  const orderId = data.orderId ?? data.order_id;
  if (orderId == null) {
    console.warn("⚠️  Mensaje sin orderId, descartado:", data);
    return;
  }

  const dedupKey = `notif:${orderId}`;
  const result = await redisClient.set(dedupKey, "1", {
    NX: true,
    EX: DEDUP_TTL_SECONDS,
  });

  if (result !== "OK") {
    console.log(`⏭️  Notificación duplicada para orden ${orderId}, omitida.`);
    return;
  }

  console.log("📩 Nueva notificación de orden:");
  console.log({
    orderId,
    userId: data.userId ?? null,
    total: data.total,
    items: data.items,
    status: data.status,
    sentAt: new Date().toISOString(),
  });
}

async function handleVerificationRequested(data) {
  const { userId, email, code } = data;
  if (!userId || !email || !code) {
    console.warn("⚠️  Mensaje de verificación incompleto, descartado:", data);
    return;
  }

  const subject = "Tu código de verificación";
  const text =
    `Hola,\n\nTu código de acceso es ${code}.\n` +
    `Caduca en 5 minutos.\n\nTienda de Regalos.`;

  if (mailer) {
    try {
      const info = await mailer.sendMail({
        from: SMTP_FROM,
        to: email,
        subject,
        text,
      });
      console.log(`✅ Correo enviado a ${email} (messageId=${info.messageId})`);
    } catch (err) {
      console.error(`❌ Error enviando correo a ${email}:`, err.message);
      throw err; // dispara nack para reintento
    }
  } else {
    console.log("📧 [MOCK] Email de verificación:");
    console.log(`  Para: ${email} | Código: ${code} | userId: ${userId}`);
  }
}

// ── Consumer factory: bindea una queue a su exchange y consume ──
async function bindAndConsume(channel, { exchange, queue, routingKey, handler }) {
  await channel.assertExchange(exchange, "direct", { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, routingKey);

  console.log(`✅ Escuchando ${queue} (exchange=${exchange}, key=${routingKey})`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      channel.ack(msg);
    } catch (err) {
      console.error(`❌ Error procesando mensaje en ${queue}:`, err.message);
      channel.nack(msg, false, false);
    }
  });
}

// ── Conexión RabbitMQ con reconexión ───────────────────
async function startConsumer() {
  let connected = false;
  while (!connected) {
    try {
      const conn = await amqp.connect(RABBITMQ_URL);

      conn.on("error", (err) =>
        console.error("⚠️  RabbitMQ connection error:", err.message)
      );
      conn.on("close", () => {
        console.warn("⚠️  RabbitMQ cerrado. Reintentando consumer en 5s...");
        setTimeout(() => startConsumer().catch(() => {}), 5000);
      });

      const channel = await conn.createChannel();
      await channel.prefetch(10);

      await bindAndConsume(channel, {
        exchange: ORDERS_EXCHANGE,
        queue: ORDERS_QUEUE,
        routingKey: ORDERS_ROUTING_KEY,
        handler: handleOrderCreated,
      });

      await bindAndConsume(channel, {
        exchange: AUTH_EXCHANGE,
        queue: AUTH_QUEUE,
        routingKey: AUTH_ROUTING_KEY,
        handler: handleVerificationRequested,
      });

      connected = true;
    } catch (err) {
      console.log("⏳ Esperando RabbitMQ...", err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ── Healthcheck ────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Notification Service corriendo ✅" });
});

// ── Arranque ───────────────────────────────────────────
async function start() {
  await connectRedis();
  await startConsumer();
  app.listen(7000, () => {
    console.log("🚀 Notification Service en puerto 7000");
  });
}

start();
