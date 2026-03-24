const pool = require('../db/connection');
const { notifyRoom } = require('../services/notifier');

// Obtener todos los hábitos de una sala con el estado de cada miembro para hoy
const getHabitsByRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.db_id;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await pool.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // obtener hábitos de la sala
    const habitsResult = await pool.query(
      `SELECT h.*, u.name as created_by_name
       FROM habits h
       JOIN users u ON h.created_by = u.id
       WHERE h.room_id = $1
       ORDER BY h.created_at ASC`,
      [roomId]
    );

    // para cada hábito obtener qué miembros lo completaron hoy
    const habits = await Promise.all(
      habitsResult.rows.map(async (habit) => {
        const completionsResult = await pool.query(
          `SELECT hc.user_id, u.name, hc.created_at
           FROM habit_completions hc
           JOIN users u ON hc.user_id = u.id
           WHERE hc.habit_id = $1 AND hc.completed_date = $2`,
          [habit.id, today]
        );

        // obtener todos los miembros de la sala
        const membersResult = await pool.query(
          `SELECT u.id, u.name
           FROM users u
           JOIN room_members rm ON u.id = rm.user_id
           WHERE rm.room_id = $1`,
          [roomId]
        );

        // mapear miembros con su estado de completado
        const members = membersResult.rows.map((member) => ({
          ...member,
          completed: completionsResult.rows.some(
            (c) => c.user_id === member.id
          ),
        }));

        const completedCount = members.filter((m) => m.completed).length;

        return {
          ...habit,
          members,
          completed_count: completedCount,
          total_members: members.length,
        };
      })
    );

    res.status(200).json(habits);
  } catch (err) {
    next(err);
  }
};

// Crear un hábito en una sala
const createHabit = async (req, res, next) => {
  const { roomId } = req.params;
  const { name } = req.body;
  const userId = req.user.db_id;

  const client = await pool.connect();

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    await client.query('BEGIN');

    // crear el hábito
    const habitResult = await client.query(
      `INSERT INTO habits (room_id, created_by, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [roomId, userId, name]
    );

    const habit = habitResult.rows[0];

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'HABIT_CREATED',
        `Habit "${name}" was created`,
        JSON.stringify({ habit_id: habit.id }),
      ]
    );

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'HABIT_CREATED',
      habitId: habit.id,
      habitName: habit.name,
      createdBy: userId,
    });

    res.status(201).json(habit);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Marcar un hábito como completado para el día actual
// otorga coins al usuario y a la sala
const completeHabit = async (req, res, next) => {
  const { roomId, habitId } = req.params;
  const userId = req.user.db_id;
  const today = new Date().toISOString().split('T')[0];

  const client = await pool.connect();

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // verificar que el hábito existe y pertenece a la sala
    const habitCheck = await client.query(
      'SELECT * FROM habits WHERE id = $1 AND room_id = $2',
      [habitId, roomId]
    );

    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // verificar que no lo haya completado hoy
    const alreadyCompleted = await client.query(
      `SELECT * FROM habit_completions
       WHERE habit_id = $1 AND user_id = $2 AND completed_date = $3`,
      [habitId, userId, today]
    );

    if (alreadyCompleted.rows.length > 0) {
      return res.status(400).json({ error: 'Habit already completed today' });
    }

    const habit = habitCheck.rows[0];

    await client.query('BEGIN');

    // registrar completion
    await client.query(
      `INSERT INTO habit_completions (habit_id, user_id, completed_date)
       VALUES ($1, $2, $3)`,
      [habitId, userId, today]
    );

    const USER_COINS_REWARD = 5;
    const ROOM_COINS_REWARD = 3;

    // sumar coins personales
    await client.query(
      `INSERT INTO user_coins (user_id, balance)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET balance = user_coins.balance + $2, updated_at = NOW()`,
      [userId, USER_COINS_REWARD]
    );

    // registrar transacción personal
    await client.query(
      `INSERT INTO user_coin_transactions (user_id, room_id, amount, type, reason, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, roomId, USER_COINS_REWARD, 'EARN', 'HABIT_COMPLETION', habitId]
    );

    // sumar coins a la sala
    await client.query(
      `UPDATE room_coins
       SET balance = balance + $1, updated_at = NOW()
       WHERE room_id = $2`,
      [ROOM_COINS_REWARD, roomId]
    );

    // registrar transacción de sala
    await client.query(
      `INSERT INTO room_coin_transactions (room_id, source_user_id, amount, type, reason, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [roomId, userId, ROOM_COINS_REWARD, 'EARN', 'HABIT_COMPLETION', habitId]
    );

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'HABIT_COMPLETED',
        `Habit "${habit.name}" was completed`,
        JSON.stringify({ habit_id: habitId }),
      ]
    );

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'HABIT_COMPLETED',
      habitId: habitId,
      habitName: habit.name,
      completedBy: userId,
    });

    res.status(200).json({ message: 'Habit completed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Eliminar un hábito
const deleteHabit = async (req, res, next) => {
  const { roomId, habitId } = req.params;
  const userId = req.user.db_id;

  const client = await pool.connect();

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // verificar que el hábito existe
    const habitCheck = await client.query(
      'SELECT * FROM habits WHERE id = $1 AND room_id = $2',
      [habitId, roomId]
    );

    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await client.query('BEGIN');

    // eliminar el hábito — las completions se eliminan en cascada
    await client.query('DELETE FROM habits WHERE id = $1', [habitId]);

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'HABIT_DELETED',
        `Habit "${habitCheck.rows[0].name}" was deleted`,
        JSON.stringify({ habit_id: habitId }),
      ]
    );

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'HABIT_DELETED',
      habitId: habitId,
      habitName: habitCheck.rows[0].name,
      deletedBy: userId,
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  getHabitsByRoom,
  createHabit,
  completeHabit,
  deleteHabit,
};