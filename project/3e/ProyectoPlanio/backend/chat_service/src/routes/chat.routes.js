const express = require('express');
const router  = express.Router({ mergeParams: true });
const { getMessages, createMessage, toggleReaction } = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// GET  /rooms/:roomId/chat
router.get('/', getMessages);

// POST /rooms/:roomId/chat
router.post('/', createMessage);

// POST /rooms/:roomId/chat/:messageId/reactions
router.post('/:messageId/reactions', toggleReaction);

module.exports = router;