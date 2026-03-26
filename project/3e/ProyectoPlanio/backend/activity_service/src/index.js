require('dotenv').config();
const express = require('express');
const cors = require('cors');

// importar rutas
const usersRoutes = require('./routes/users.routes');
const roomsRoutes = require('./routes/rooms.routes');
const tasksRoutes = require('./routes/tasks.routes');
const habitsRoutes = require('./routes/habits.routes');
const coinsRoutes = require('./routes/coins.routes');
const logsRoutes = require('./routes/logs.routes');

// importar middleware
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 8001;

// middleware global
app.use(cors());
app.use(express.json());

// health check — para que docker y el gateway sepan que el servicio está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'activity-service' });
});

// rutas simples
app.use('/users', usersRoutes);
app.use('/rooms', roomsRoutes);
app.use('/coins', coinsRoutes);

// rutas anidadas bajo rooms
app.use('/rooms/:roomId/tasks', tasksRoutes);
app.use('/rooms/:roomId/habits', habitsRoutes);
app.use('/rooms/:roomId/logs', logsRoutes);

// middleware de errores — siempre al final
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Activity Service running on port ${PORT}`);
});