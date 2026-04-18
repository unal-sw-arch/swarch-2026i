require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 8004;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/analytics', analyticsRoutes);

// Ruta de salud para verificar que el servicio está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics_service' });
});

// Arrancar
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Analytics Service corriendo en puerto ${PORT}`);
  });
});