const express = require('express');
const router = express.Router({ mergeParams: true });
const { getActivityLogs } = require('../controllers/logs.controller');
const authMiddleware = require('../middleware/auth.middleware.dev');

router.use(authMiddleware);

// GET /rooms/:roomId/logs?limit=20&offset=0 — obtener historial de actividad
router.get('/', getActivityLogs);

module.exports = router;