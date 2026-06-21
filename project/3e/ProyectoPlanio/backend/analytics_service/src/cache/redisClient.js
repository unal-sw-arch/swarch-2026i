const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(REDIS_URL, {
  // Si Redis se cae, no queremos que el servicio se caiga con él.
  // Reintenta conectar con backoff simple.
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1 // si Redis no responde rápido, fallamos rápido y vamos a Mongo
});

redisClient.on('connect', () => {
  console.log('Analytics Service conectado a Redis (Analytics Cache)');
});

redisClient.on('error', (err) => {
  // No tiramos el proceso, la caché es una optimización, no una dependencia critica.
  console.error('Error de conexión con Redis:', err.message);
});

module.exports = redisClient;
