const mongoose = require('mongoose');
const { getOrSetCache, invalidateCache } = require('../cache/cacheHelper');

// TTL de la caché en segundos. 60s es razonable para datos que cambian con cada tarea/hábito completado pero no necesitan ser "tiempo real".
const STREAK_TTL_SECONDS = 60;
const LEADERBOARD_TTL_SECONDS = 60;

// Esquema para guardar eventos
const eventSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  userName: { type: String, required: true },
  roomId: { type: Number, required: true },
  type: { type: String, enum: ['HABIT_COMPLETED', 'TASK_COMPLETED'], required: true },
  date: { type: String, required: true }, // formato YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

// Recibir un evento desde activity_service

const registerEvent = async (req, res) => {
  try {
    const { userId, userName, roomId, type, date } = req.body;

    const event = new Event({ userId, userName, roomId, type, date });
    await event.save();

    // Invalidar caché: el nuevo evento puede cambiar la racha y/o el leaderboard, así que las claves cacheadas quedan obsoletas y deben recalcularse en la próxima consulta.
    await invalidateCache([
      `streak:room:${roomId}:user:${userId}`,
      `leaderboard:room:${roomId}`
    ]);

    res.status(201).json({ message: 'Evento registrado' });
  } catch (error) {
    console.error('Error registrando evento:', error.message);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Racha: dias consecutivos donde el usuario completo al menos 1 habito

const getStreak = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const cacheKey = `streak:room:${roomId}:user:${userId}`;

    const { data, fromCache } = await getOrSetCache(cacheKey, STREAK_TTL_SECONDS, async () => {
      // Traer todos los dias donde el usuario completo algun habito
      const completions = await Event.find({
        roomId: Number(roomId),
        userId: Number(userId),
        type: 'HABIT_COMPLETED'
      }).distinct('date');

      // Ordenar fechas de mas reciente a mas antigua
      const sortedDates = completions.sort((a, b) => b.localeCompare(a));

      if (sortedDates.length === 0) {
        return { userId: Number(userId), streak: 0 };
      }

      // Contar dias consecutivos desde hoy hacia atras
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      let checking = today;

      for (const date of sortedDates) {
        if (date === checking) {
          streak++;
          // Retroceder un dia
          const prev = new Date(checking);
          prev.setDate(prev.getDate() - 1);
          checking = prev.toISOString().split('T')[0];
        } else {
          break; // Se rompio la racha
        }
      }

      return { userId: Number(userId), streak };
    });

    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json(data);
  } catch (error) {
    console.error('Error calculando racha:', error.message);
    res.status(500).json({ error: 'Error interno' });
  }
};

// Quien completo mas tareas en la semana actual

const getLeaderboard = async (req, res) => {
  try {
    const { roomId } = req.params;
    const cacheKey = `leaderboard:room:${roomId}`;

    const { data, fromCache } = await getOrSetCache(cacheKey, LEADERBOARD_TTL_SECONDS, async () => {
      // Calcular inicio de la semana 
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=domingo, 1=lunes...
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diff);
      const startOfWeek = monday.toISOString().split('T')[0];

      // Agrupar por usuario y contar tareas completadas esta semana
      const results = await Event.aggregate([
        {
          $match: {
            roomId: Number(roomId),
            type: 'TASK_COMPLETED',
            date: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: { userId: '$userId', userName: '$userName' },
            totalTasks: { $sum: 1 }
          }
        },
        {
          $sort: { totalTasks: -1 } // de mayor a menor
        },
        {
          $limit: 3 //podio de 3
        }
      ]);

      // Formatear la respuesta
      const leaderboard = results.map((item, index) => ({
        position: index + 1,
        userId: item._id.userId,
        userName: item._id.userName,
        totalTasks: item.totalTasks
      }));

      return { roomId: Number(roomId), weekStart: startOfWeek, leaderboard };
    });

    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json(data);
  } catch (error) {
    console.error('Error calculando leaderboard:', error.message);
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = { registerEvent, getStreak, getLeaderboard };