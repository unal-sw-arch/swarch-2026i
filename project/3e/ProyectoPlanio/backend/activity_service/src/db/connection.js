const { Pool } = require('pg');

// Pool de conexiones a PostgreSQL
// Pool maneja múltiples conexiones simultáneas automáticamente
// evitando bloqueos cuando llegan varias peticiones al mismo tiempo
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
  process.exit(-1);
});

module.exports = pool;