const pool = require('../db/connection');

// Obtener el historial de actividad de una sala
// ordenado de más reciente a más antiguo
const getActivityLogs = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.db_id;
  const limit = parseInt(req.query.limit) || 20; // por defecto 20 registros
  const offset = parseInt(req.query.offset) || 0; // para paginación

  try {
    // verificar que el usuario es miembro de la sala
    const memberCheck = await pool.query(
      'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // obtener logs con el nombre del actor
    const result = await pool.query(
      `SELECT 
        al.*,
        u.name as actor_name
       FROM activity_logs al
       JOIN users u ON al.actor_id = u.id
       WHERE al.room_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    // obtener total de logs para paginación
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM activity_logs WHERE room_id = $1',
      [roomId]
    );

    res.status(200).json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivityLogs,
};