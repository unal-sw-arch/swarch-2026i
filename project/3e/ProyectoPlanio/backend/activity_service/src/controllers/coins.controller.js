const pool = require('../db/connection');

// Obtener balance de monedas personales del usuario
const getUserCoins = async (req, res, next) => {
  const userId = req.user.db_id;

  try {
    const result = await pool.query(
      'SELECT * FROM user_coins WHERE user_id = $1',
      [userId]
    );

    // si no existe el registro, el balance es 0
    const balance = result.rows.length > 0 ? result.rows[0].balance : 0;

    res.status(200).json({ user_id: userId, balance });
  } catch (err) {
    next(err);
  }
};

// Obtener balance de monedas de una sala
const getRoomCoins = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.db_id;

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await pool.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const result = await pool.query(
      'SELECT * FROM room_coins WHERE room_id = $1',
      [roomId]
    );

    const balance = result.rows.length > 0 ? result.rows[0].balance : 0;

    res.status(200).json({ room_id: roomId, balance });
  } catch (err) {
    next(err);
  }
};

// Obtener historial de transacciones personales del usuario
const getUserTransactions = async (req, res, next) => {
  const userId = req.user.db_id;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const result = await pool.query(
      `SELECT * FROM user_coin_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Obtener historial de transacciones de una sala
const getRoomTransactions = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.db_id;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await pool.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const result = await pool.query(
      `SELECT rct.*, u.name as source_user_name
       FROM room_coin_transactions rct
       LEFT JOIN users u ON rct.source_user_id = u.id
       WHERE rct.room_id = $1
       ORDER BY rct.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};
// Gastar coins personales — lo llama el Personalization Service
// cuando un usuario compra un item para su avatar
const spendUserCoins = async (req, res, next) => {
  const { userId, amount, reason, roomId } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // verificar que tiene suficiente balance
    const balanceResult = await client.query(
      'SELECT balance FROM user_coins WHERE user_id = $1',
      [userId]
    );

    const balance = balanceResult.rows.length > 0 
      ? balanceResult.rows[0].balance 
      : 0;

    if (balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // descontar coins
    await client.query(
      `UPDATE user_coins 
       SET balance = balance - $1, updated_at = NOW()
       WHERE user_id = $2`,
      [amount, userId]
    );

    // registrar transacción
    await client.query(
      `INSERT INTO user_coin_transactions (user_id, room_id, amount, type, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, roomId || null, amount, 'SPEND', reason || 'AVATAR_PURCHASE']
    );

    await client.query('COMMIT');

    res.status(200).json({ message: 'Coins spent successfully', balance: balance - amount });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Gastar coins de una sala — lo llama el Personalization Service
// cuando la sala compra un item para la sala virtual
const spendRoomCoins = async (req, res, next) => {
  const { roomId, amount, reason, sourceUserId } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // verificar que tiene suficiente balance
    const balanceResult = await client.query(
      'SELECT balance FROM room_coins WHERE room_id = $1',
      [roomId]
    );

    const balance = balanceResult.rows.length > 0
      ? balanceResult.rows[0].balance
      : 0;

    if (balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient room coins' });
    }

    // descontar coins
    await client.query(
      `UPDATE room_coins
       SET balance = balance - $1, updated_at = NOW()
       WHERE room_id = $2`,
      [amount, roomId]
    );

    // registrar transacción
    await client.query(
      `INSERT INTO room_coin_transactions (room_id, source_user_id, amount, type, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [roomId, sourceUserId || null, amount, 'SPEND', reason || 'ROOM_PURCHASE']
    );

    await client.query('COMMIT');

    res.status(200).json({ message: 'Room coins spent successfully', balance: balance - amount });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  getUserCoins,
  getRoomCoins,
  getUserTransactions,
  getRoomTransactions,
  spendUserCoins,
  spendRoomCoins,
};