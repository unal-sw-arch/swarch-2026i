const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

// ── WebSocket Server ──────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });


const roomConnections = new Map();
const clientInfo = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const roomId = url.searchParams.get('roomId');
  const userId = url.searchParams.get('userId');

  if (!roomId || !userId) {
    ws.close(4001, 'roomId and userId required');
    return;
  }

  // Registrar la conexión en el mapa de la sala
  if (!roomConnections.has(roomId)) {
    roomConnections.set(roomId, new Set());
  }
  roomConnections.get(roomId).add(ws);
  clientInfo.set(ws, { roomId, userId });

  console.log(`Conectado: userId=${userId} roomId=${roomId}`);

  // Confirmar conexión al cliente
  ws.send(JSON.stringify({ type: 'CONNECTED', roomId, userId }));

  ws.on('close', () => {
    const info = clientInfo.get(ws);
    if (info) {
      roomConnections.get(info.roomId)?.delete(ws);
      if (roomConnections.get(info.roomId)?.size === 0) {
        roomConnections.delete(info.roomId);
      }
      clientInfo.delete(ws);
      console.log(`Desconectado: userId=${info.userId} roomId=${info.roomId}`);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

// ── HTTP: recibe eventos del Activity Service ─────────────────────────
app.post('/notify', (req, res) => {
  const { roomId, targetUserId, ...payload } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId required' });
  }

  const clients = roomConnections.get(roomId);
  if (!clients || clients.size === 0) {
    return res.json({ delivered: 0, message: 'No hay usuarios conectados en esta sala' });
  }

  let delivered = 0;
  const message = JSON.stringify(payload);

  for (const ws of clients) {
    if (ws.readyState !== 1) continue;

    if (targetUserId) {
      const info = clientInfo.get(ws);
      if (info?.userId !== targetUserId) continue;
    }

    ws.send(message);
    delivered++;
  }

  console.log(`Notificación enviada a ${delivered} usuario(s) en sala ${roomId}`);
  res.json({ delivered, roomId });
});

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const rooms = roomConnections.size;
  let totalConnections = 0;
  roomConnections.forEach((set) => (totalConnections += set.size));

  res.json({
    status: 'ok',
    service: 'notification-service',
    rooms,
    connections: totalConnections,
  });
});

server.listen(PORT, () => {
  console.log(`Notification Service corriendo en puerto ${PORT} (HTTP + WebSocket)`);
});