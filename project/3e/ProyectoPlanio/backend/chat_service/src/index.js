require('dotenv').config();
require('./db/connection');

const express = require('express');
const cors    = require('cors');

const chatRoutes     = require('./routes/chat.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app  = express();
const PORT = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

// GET  /rooms/:roomId/chat
// POST /rooms/:roomId/chat
// POST /rooms/:roomId/chat/:messageId/reactions
app.use('/rooms/:roomId/chat', chatRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[Chat Service] Running on port ${PORT}`);
});