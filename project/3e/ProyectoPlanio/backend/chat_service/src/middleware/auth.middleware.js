const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
}

const authMiddleware = async (req, res, next) => {
  // El gateway inyecta x-user-uid y x-user-name — si llegan, confiar en ellos
  const uid  = req.headers['x-user-uid'];
  const name = req.headers['x-user-name'] || req.headers['x-user-email'] || 'Unknown';

  if (uid) {
    req.user = { uid, name, db_id: 0 };
    return next();
  }

  // Fallback: verificar token Bearer directamente
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
    req.user = { uid: decoded.uid, name: decoded.name || decoded.email || 'Unknown', db_id: 0 };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;