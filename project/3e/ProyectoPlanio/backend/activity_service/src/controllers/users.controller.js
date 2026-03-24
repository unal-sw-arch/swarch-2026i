const pool = require('../db/connection');

// Obtener o crear usuario al hacer login con Firebase
// Firebase nos da el email, nombre y google_id
// Si el usuario ya existe lo retorna, si no lo crea
const loginOrRegister = async (req, res, next) => {
  const { email, name, google_id } = req.body;

  try {
    // verificar si el usuario ya existe
    const existing = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [google_id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0]);
    }

    // si no existe, crearlo
    const result = await pool.query(
      `INSERT INTO users (email, name, google_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, name, google_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Obtener usuario por id
const getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginOrRegister,
  getUserById,
};