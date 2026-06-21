const redisClient = require('./redisClient');

/**
 * @param {string} key - clave única que identifica la consulta (ej: "streak:room:5:user:12")
 * @param {number} ttlSeconds - tiempo de vida de la entrada en caché
 * @param {Function} fetchFn - función async que calcula el valor real si hay cache miss
 * @returns {Promise<{ data: any, fromCache: boolean }>}
 */
async function getOrSetCache(key, ttlSeconds, fetchFn) {
  try {
    const cached = await redisClient.get(key);
    if (cached !== null) {
      return { data: JSON.parse(cached), fromCache: true };
    }
  } catch (err) {
    console.error(`[cache] Error leyendo clave "${key}" de Redis:`, err.message);
    // seguimos sin caché, no propagamos el error
  }

  // Cache miss (o Redis no disponible): calculamos el valor real
  const freshData = await fetchFn();

  try {
    await redisClient.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`[cache] Error escribiendo clave "${key}" en Redis:`, err.message);
    // si no se pudo guardar, no pasa nada, la próxima consulta volverá a calcular
  }

  return { data: freshData, fromCache: false };
}

/**
 * Borra una o varias claves de la caché. Se usa cuando llega un nuevo evento que vuelve obsoletos los datos cacheados.
 *
 * @param {string[]} keys
 */
async function invalidateCache(keys) {
  if (!keys || keys.length === 0) return;
  try {
    await redisClient.del(keys);
  } catch (err) {
    console.error('[cache] Error invalidando claves:', err.message);
  }
}

module.exports = { getOrSetCache, invalidateCache };
