const express = require('express');
const router = express.Router();
const {
  getAvatarShop,
  getRoomShop,
  getAvatarItemById,
  getRoomItemById,
} = require('../controllers/shop.controller');
const authMiddleware = require('../middleware/auth.middleware.dev');

router.use(authMiddleware);

// GET /shop/avatar?category=hat — catálogo de items para avatar
router.get('/avatar', getAvatarShop);

// GET /shop/avatar/:itemId — item específico de avatar
router.get('/avatar/:itemId', getAvatarItemById);

// GET /shop/room?category=furniture — catálogo de items para sala
router.get('/room', getRoomShop);

// GET /shop/room/:itemId — item específico de sala
router.get('/room/:itemId', getRoomItemById);

module.exports = router;