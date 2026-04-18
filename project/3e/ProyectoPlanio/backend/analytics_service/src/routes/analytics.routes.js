const express = require('express');
const router = express.Router();
const { registerEvent, getStreak, getLeaderboard } = require('../controllers/analytics.controller');

// Recibir evento desde activity_service
router.post('/events', registerEvent);

// Racha de un usuario en una sala
router.get('/rooms/:roomId/streak/:userId', getStreak);

// Leaderboard semanal de una sala
router.get('/rooms/:roomId/leaderboard', getLeaderboard);

module.exports = router;