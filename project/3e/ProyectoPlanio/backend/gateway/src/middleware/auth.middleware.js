const admin = require('firebase-admin');

// Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

/**
 * Middleware de autenticación del Gateway.
 *
 * Verifica el token Firebase del header Authorization,
 * y si es válido inyecta los datos del usuario como headers
 * para que los microservicios los puedan leer sin tener que
 * verificar Firebase ellos mismos.
 *
 * Headers que se inyectan aguas abajo:
 *   x-user-uid    → UID de Firebase (google_id en la DB)
 *   x-user-email  → email del usuario
 *   x-user-name   → nombre del usuario
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Inyectar identidad como headers internos.
    // Los microservicios leen estos headers en vez de verificar Firebase.
    req.headers['x-user-uid']   = decoded.uid;
    req.headers['x-user-email'] = decoded.email || '';
    req.headers['x-user-name']  = decoded.name  || decoded.email || '';

    next();
  } catch (err) {
    console.error('[Gateway] Token inválido:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
