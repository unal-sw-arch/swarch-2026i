const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  getUserRooms,
  getRoomById,
} = require('../controllers/rooms.controller');
const authMiddleware = require('../middleware/auth.middleware');

// todos los endpoints de salas requieren autenticación
router.use(authMiddleware);

// POST /rooms — crear sala
router.post('/', createRoom);

// POST /rooms/join — unirse a sala con código
router.post('/join', joinRoom);

// GET /rooms — obtener todas las salas del usuario
router.get('/', getUserRooms);

// GET /rooms/:roomId — obtener detalle de una sala
router.get('/:roomId', getRoomById);

module.exports = router;