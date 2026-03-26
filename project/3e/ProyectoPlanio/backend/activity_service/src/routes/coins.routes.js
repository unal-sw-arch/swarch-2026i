const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getUserCoins,
  getRoomCoins,
  getUserTransactions,
  getRoomTransactions,
  spendUserCoins, 
  spendRoomCoins, 
} = require('../controllers/coins.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET /coins/me — balance personal del usuario
router.get('/me', getUserCoins);

// GET /coins/me/transactions — historial de transacciones personales
router.get('/me/transactions', getUserTransactions);

// GET /coins/rooms/:roomId — balance de una sala
router.get('/rooms/:roomId', getRoomCoins);

// GET /coins/rooms/:roomId/transactions — historial de transacciones de una sala
router.get('/rooms/:roomId/transactions', getRoomTransactions);

router.post('/spend/user', spendUserCoins);

router.post('/spend/room', spendRoomCoins);
module.exports = router;