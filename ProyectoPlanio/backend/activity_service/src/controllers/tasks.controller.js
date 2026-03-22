const pool = require('../db/connection');
const { notifyRoom, notifyUser } = require('../services/notifier');

// Obtener todas las tareas de una sala
const getTasksByRoom = async (req, res, next) => {
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

    // obtener tareas con info del usuario asignado y quien la creó
    const result = await pool.query(
      `SELECT 
        t.*,
        u1.name as assigned_to_name,
        u2.name as created_by_name,
        u3.name as completed_by_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       LEFT JOIN users u3 ON t.completed_by = u3.id
       WHERE t.room_id = $1
       ORDER BY t.created_at DESC`,
      [roomId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Crear una tarea en una sala
const createTask = async (req, res, next) => {
  const { roomId } = req.params;
  const { title, description, assigned_to } = req.body;
  const userId = req.user.db_id;

  const client = await pool.connect();

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await client.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    await client.query('BEGIN');

    // crear la tarea
    const taskResult = await client.query(
      `INSERT INTO tasks (room_id, created_by, assigned_to, title, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [roomId, userId, assigned_to || null, title, description || null]
    );

    const task = taskResult.rows[0];

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'TASK_CREATED',
        `Task "${title}" was created`,
        JSON.stringify({ task_id: task.id }),
      ]
    );

    // si tiene asignado, registrar también el log de asignación
    if (assigned_to) {
      await client.query(
        `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          roomId,
          userId,
          'TASK_ASSIGNED',
          `Task "${title}" was assigned`,
          JSON.stringify({ task_id: task.id, target_user_id: assigned_to }),
        ]
      );
    }

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'TASK_CREATED',
      taskId: task.id,
      taskTitle: task.title,
      createdBy: userId,
    });

    if (assigned_to) {
      notifyUser(roomId, assigned_to, {
        type: 'TASK_ASSIGNED',
        taskId: task.id,
        taskTitle: task.title,
        assignedBy: userId,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Actualizar una tarea — título, descripción o asignado
const updateTask = async (req, res, next) => {
  const { roomId, taskId } = req.params;
  const { title, description, assigned_to } = req.body;
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

    // verificar que la tarea existe y pertenece a la sala
    const taskCheck = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND room_id = $2',
      [taskId, roomId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = taskCheck.rows[0];

    await client.query('BEGIN');

    // actualizar solo los campos que vienen en el body
    const taskResult = await client.query(
      `UPDATE tasks
       SET 
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         assigned_to = COALESCE($3, assigned_to),
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title || null, description || null, assigned_to || null, taskId]
    );

    const updatedTask = taskResult.rows[0];

    // registrar log si cambió el asignado
    if (assigned_to && assigned_to !== oldTask.assigned_to) {
      await client.query(
        `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          roomId,
          userId,
          'TASK_ASSIGNED',
          `Task "${updatedTask.title}" was reassigned`,
          JSON.stringify({
            task_id: taskId,
            target_user_id: assigned_to,
          }),
        ]
      );
    }

    await client.query('COMMIT');

    // notificar a la sala que se actualizó una tarea
    notifyRoom(roomId, {
      type: 'TASK_UPDATED',
      taskId: taskId,
      taskTitle: updatedTask.title,
      updatedBy: userId,
    });

    // si cambió el asignado, notificar al nuevo usuario 
    if (assigned_to && assigned_to !== oldTask.assigned_to) {
      notifyUser(roomId, assigned_to, {
        type: 'TASK_ASSIGNED',
        taskId: taskId,
        taskTitle: updatedTask.title,
        assignedBy: userId,
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Cambiar estado de una tarea — TODO o DONE
// cuando se marca como DONE se otorgan coins al usuario y a la sala
const updateTaskStatus = async (req, res, next) => {
  const { roomId, taskId } = req.params;
  const { status } = req.body;
  const userId = req.user.db_id;

  if (!['TODO', 'DONE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be TODO or DONE' });
  }

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

    // verificar que la tarea existe
    const taskCheck = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND room_id = $2',
      [taskId, roomId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldTask = taskCheck.rows[0];

    // si ya tiene ese estado no hacer nada
    if (oldTask.status === status) {
      return res.status(400).json({ error: `Task is already ${status}` });
    }

    await client.query('BEGIN');

    // actualizar estado de la tarea
    const taskResult = await client.query(
      `UPDATE tasks
       SET
         status = $1,
         completed_by = $2,
         completed_at = $3,
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        status,
        status === 'DONE' ? userId : null,
        status === 'DONE' ? new Date() : null,
        taskId,
      ]
    );

    const updatedTask = taskResult.rows[0];

    // registrar log de cambio de estado
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'TASK_STATUS_CHANGED',
        `Task "${updatedTask.title}" moved to ${status}`,
        JSON.stringify({
          task_id: taskId,
          old_status: oldTask.status,
          new_status: status,
        }),
      ]
    );

    // si se marcó como DONE otorgar coins
    if (status === 'DONE') {
      const USER_COINS_REWARD = 10;
      const ROOM_COINS_REWARD = 5;

      // sumar coins personales al usuario
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
        [userId, roomId, USER_COINS_REWARD, 'EARN', 'TASK_COMPLETION', taskId]
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
        [roomId, userId, ROOM_COINS_REWARD, 'EARN', 'TASK_COMPLETION', taskId]
      );
    }

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'TASK_STATUS_CHANGED',
      taskId: taskId,
      taskTitle: updatedTask.title,
      status: status,
      changedBy: userId,
    });

    res.status(200).json(updatedTask);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Eliminar una tarea
const deleteTask = async (req, res, next) => {
  const { roomId, taskId } = req.params;
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

    // verificar que la tarea existe
    const taskCheck = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND room_id = $2',
      [taskId, roomId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await client.query('BEGIN');

    // eliminar la tarea
    await client.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    // registrar en activity_logs
    await client.query(
      `INSERT INTO activity_logs (room_id, actor_id, action_type, description, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        roomId,
        userId,
        'TASK_DELETED',
        `Task "${taskCheck.rows[0].title}" was deleted`,
        JSON.stringify({ task_id: taskId }),
      ]
    );

    await client.query('COMMIT');

    notifyRoom(roomId, {
      type: 'TASK_DELETED',
      taskId: taskId,
      taskTitle: taskCheck.rows[0].title,
      deletedBy: userId,
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = {
  getTasksByRoom,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};