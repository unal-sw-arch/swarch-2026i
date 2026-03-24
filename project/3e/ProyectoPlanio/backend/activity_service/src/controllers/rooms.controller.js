const pool = require('../db/connection');
const { notifyRoom } = require('../services/notifier');

// Crear una sala nueva
// El usuario que la crea se agrega automáticamente como miembro
// y se inicializa su balance de room_coins en 0
const createRoom = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.db_id; // id del usuario en PostgreSQL

  // generar código de invitación único de 6 caracteres
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const inviteLink = `${process.env.APP_URL || 'http://localhost:5173'}/join/${inviteCode}`;

  // usar un cliente del pool para poder hacer una transacción
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // crear la sala
    const roomResult = await client.query(
      `INSERT INTO rooms (name, invite_code, invite_link, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, inviteCode, inviteLink, userId]
    );
    const room = roomResult.rows[0];

    // agregar al creador como miembro
    await client.query(
      `INSERT INTO room_members (room_id, user_id)
       VALUES ($1, $2)`,
      [room.id, userId]
    );

    // inicializar room_coins en 0
    await client.query(
      `INSERT INTO room_coins (room_id, balance)
       VALUES ($1, 0)`,
      [room.id]
    );

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        room.id,
        userId,
        'ROOM_CREATED',
        `Room "${name}" was created`,
        JSON.stringify({ room_id: room.id }),
      ]
    );

    await client.query('COMMIT');

    res.status(201).json(room);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    // siempre liberar el cliente de vuelta al pool
    client.release();
  }
};

// Unirse a una sala con código de invitación
const joinRoom = async (req, res, next) => {
  const { invite_code } = req.body;
  const userId = req.user.db_id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // buscar la sala por código
    const roomResult = await client.query(
      'SELECT * FROM rooms WHERE invite_code = $1',
      [invite_code]
    );

    if (roomResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // verificar que el usuario no sea ya miembro
    const memberResult = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [room.id, userId]
    );

    if (memberResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already a member of this room' });
    }

    // agregar como miembro
    await client.query(
      `INSERT INTO room_members (room_id, user_id)
       VALUES ($1, $2)`,
      [room.id, userId]
    );

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        room.id,
        userId,
        'MEMBER_JOINED',
        `User joined the room`,
        JSON.stringify({ user_id: userId }),
      ]
    );

    await client.query('COMMIT');

    notifyRoom(room.id, {
      type: 'MEMBER_JOINED',
      userId: userId,
    });

    res.status(200).json(room);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Obtener todas las salas de un usuario
const getUserRooms = async (req, res, next) => {
  const userId = req.user.db_id;

  try {
    const result = await pool.query(
      `SELECT r.*, 
        rc.balance as coins,
        COUNT(rm.user_id) as member_count
       FROM rooms r
       JOIN room_members rm ON r.id = rm.room_id
       JOIN room_coins rc ON r.id = rc.room_id
       WHERE r.id IN (
         SELECT room_id FROM room_members WHERE user_id = $1
       )
       GROUP BY r.id, rc.balance
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Obtener detalle de una sala con sus miembros
const getRoomById = async (req, res, next) => {
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

    // obtener sala con miembros y coins
    const roomResult = await pool.query(
      `SELECT r.*, rc.balance as coins
       FROM rooms r
       JOIN room_coins rc ON r.id = rc.room_id
       WHERE r.id = $1`,
      [roomId]
    );

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, rm.joined_at
       FROM users u
       JOIN room_members rm ON u.id = rm.user_id
       WHERE rm.room_id = $1
       ORDER BY rm.joined_at ASC`,
      [roomId]
    );

    res.status(200).json({
      ...roomResult.rows[0],
      members: membersResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getUserRooms,
  getRoomById,
};