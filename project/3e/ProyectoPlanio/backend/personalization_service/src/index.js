require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/connection');

// importar rutas
const shopRoutes = require('./routes/shop.routes');
const avatarsRoutes = require('./routes/avatars.routes');
const roomsRoutes = require('./routes/rooms.routes');

// importar middleware
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 8002;

// middleware global
app.use(cors());
app.use(express.json());

// conectar a MongoDB antes de levantar el servidor
connectDB().then(() => {
  // health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'personalization-service' });
  });

  // rutas
  app.use('/shop', shopRoutes);
  app.use('/avatars', avatarsRoutes);
  app.use('/rooms', roomsRoutes);

  // middleware de errores — siempre al final
  app.use(errorMiddleware);

  app.listen(PORT, () => {
    console.log(`Personalization Service running on port ${PORT}`);
  });
});