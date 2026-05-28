const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

// Añadimos opciones mínimas y listeners para facilitar el diagnóstico
const client = createClient({ url: REDIS_URL, socket: { connectTimeout: 10000 } });

client.on("error", (err) => console.error("Redis (gateway) error:", err && err.message ? err.message : err));
client.on("end", () => console.warn("Redis (gateway) connection ended"));
client.on("reconnecting", () => console.log("Redis (gateway) attempting to reconnect..."));
client.on("ready", () => console.log("Redis (gateway) ready"));

let connected = false;

// Intentamos conectarnos con reintentos y backoff para evitar logs flood y dar más info
async function connect(retries = 5, baseDelay = 1000) {
  if (connected) return client;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Redis (gateway) connect attempt ${attempt}/${retries} -> ${REDIS_URL}`);
      await client.connect();
      connected = true;
      console.log("✅ Gateway conectado a Redis");
      return client;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.error(`Redis (gateway) connect attempt ${attempt} failed:`, msg);
      if (attempt < retries) {
        const delay = baseDelay * attempt;
        console.log(`Redis (gateway) retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error("Redis (gateway) could not connect after retries. The gateway will continue running but Redis operations may fail.");
  return client;
}

module.exports = { client, connect };
