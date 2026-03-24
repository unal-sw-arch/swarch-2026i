const express = require('express');
const router = express.Router();
const {
  getAvatar,
  purchaseAvatarItem,
  toggleEquipItem,
} = require('../controllers/avatars.controller');
const authMiddleware = require('../middleware/auth.middleware.dev');

router.use(authMiddleware);

// GET /avatars/:roomId — obtener avatar del usuario en una sala
router.get('/:roomId', getAvatar);

// POST /avatars/:roomId/items — comprar item para avatar
router.post('/:roomId/items', purchaseAvatarItem);

// PATCH /avatars/:roomId/items/:itemId — equipar o desequipar item
router.patch('/:roomId/items/:itemId', toggleEquipItem);

module.exports = router;