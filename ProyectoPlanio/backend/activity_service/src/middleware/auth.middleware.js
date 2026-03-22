const admin = require('firebase-admin');
const pool = require('../db/connection');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // verificar token con Firebase
    const decoded = await admin.auth().verifyIdToken(token);

    // buscar el usuario en PostgreSQL por google_id
    const result = await pool.query(
      'SELECT id FROM users WHERE google_id = $1',
      [decoded.uid]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not registered' });
    }

    // agregar tanto los datos de Firebase como el id de PostgreSQL
    req.user = {
      ...decoded,
      db_id: result.rows[0].id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;