const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getHabitsByRoom,
  createHabit,
  completeHabit,
  deleteHabit,
} = require('../controllers/habits.controller');
const authMiddleware = require('../middleware/auth.middleware');

// todos los endpoints requieren autenticación
router.use(authMiddleware);

// GET /rooms/:roomId/habits — obtener hábitos de una sala con estado del día
router.get('/', getHabitsByRoom);

// POST /rooms/:roomId/habits — crear hábito
router.post('/', createHabit);

// POST /rooms/:roomId/habits/:habitId/complete — marcar hábito como completado
router.post('/:habitId/complete', completeHabit);

// DELETE /rooms/:roomId/habits/:habitId — eliminar hábito
router.delete('/:habitId', deleteHabit);

module.exports = router;