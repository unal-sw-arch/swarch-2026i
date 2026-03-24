const express = require('express');
const router = express.Router();
const {
  getRoom,
  purchaseRoomItem,
  placeOrMoveItem,
  removeRoomItem,
} = require('../controllers/rooms.controller');
const authMiddleware = require('../middleware/auth.middleware.dev');

router.use(authMiddleware);

// GET /rooms/:roomId — obtener estado de la sala virtual
router.get('/:roomId', getRoom);

// POST /rooms/:roomId/items — comprar item para la sala
router.post('/:roomId/items', purchaseRoomItem);

// PATCH /rooms/:roomId/items/:itemId — colocar o mover item
router.patch('/:roomId/items/:itemId', placeOrMoveItem);

// DELETE /rooms/:roomId/items/:itemId — eliminar item de la sala
router.delete('/:roomId/items/:itemId', removeRoomItem);

module.exports = router;