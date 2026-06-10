const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { connect: connectRabbit, publishVerificationRequested } = require("./rabbitmq");
const { client: redis, connect: connectRedis } = require("./redis");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3001",
    "https://tienda-regalos-frontend.vercel.app"
  ], 
  credentials: true
}));
app.use(express.json());

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:4000";
const ORDER_SERVICE_URL   = process.env.ORDER_SERVICE_URL   || "http://order-service:5000";
const REVIEW_SERVICE_URL  = process.env.REVIEW_SERVICE_URL  || "http://review-service:6000";
const AUTH_SERVICE_URL    = process.env.AUTH_SERVICE_URL    || "http://auth-service:8080";
const SECRET_KEY = "GrupoF_Secret";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado: Se requiere autenticación" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; 
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

app.get("/", (req, res) => {
  res.send("API Gateway funcionando");
});

// ── RUTAS DEL CARRITO ──────────────────────
app.get("/api/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const response = await axios.get(`${ORDER_SERVICE_URL}/cart`, {
      headers: { "x-user-id": userId }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

app.post("/api/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const response = await axios.post(`${ORDER_SERVICE_URL}/cart`, req.body, {
      headers: { "x-user-id": userId }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error al añadir al carrito" });
  }
});

app.delete("/api/cart/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const response = await axios.delete(`${ORDER_SERVICE_URL}/cart/${req.params.id}`, {
      headers: { "x-user-id": userId }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar del carrito" });
  }
});

// ── AUTENTICACIÓN ──────────────────────
app.post("/api/register", async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/register`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Error" });
  }
});

// ── LOGIN EN 2 PASOS ──────────────────────
// Paso 1: valida credenciales con auth-service, genera código,
//         lo guarda en Redis y publica un evento en RabbitMQ.
//         NO devuelve el JWT todavía.
app.post("/api/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body);
    const { token } = response.data;
    if (!token) return res.status(500).json({ error: "auth-service no devolvió token" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId || decoded.id;

    const code = String(Math.floor(100000 + Math.random() * 900000));

    await redis.set(
      `auth:code:${userId}`,
      JSON.stringify({ code, token, email }),
      { EX: 300 }
    );

    publishVerificationRequested({ userId, email, code });

    res.json({
      message: "Código de verificación enviado al correo",
      userId,
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    console.error("Error /api/login:", error.message);
    res.status(500).json({ error: "Error procesando login" });
  }
});

// Paso 2: cliente envía {userId, code}. Si coincide con Redis,
//         devuelve el JWT que se guardó en el paso 1 y borra la clave.
app.post("/api/login/verify", async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: "userId y code requeridos" });
    }

    const raw = await redis.get(`auth:code:${userId}`);
    if (!raw) {
      return res.status(401).json({ error: "Código expirado o inexistente" });
    }

    const stored = JSON.parse(raw);
    if (stored.code !== String(code)) {
      return res.status(401).json({ error: "Código incorrecto" });
    }

    await redis.del(`auth:code:${userId}`);

    res.json({ token: stored.token, message: "Verificación exitosa" });
  } catch (error) {
    console.error("Error /api/login/verify:", error.message);
    res.status(500).json({ error: "Error verificando código" });
  }
});

// ── PRODUCTOS ──────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});

app.post("/api/products", verifyToken, async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCT_SERVICE_URL}/products`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error creando producto" });
  }
});

app.put("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const response = await axios.put(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error actualizando producto" });
  }
});

app.delete("/api/products/:id", verifyToken, async (req, res) => {
  try {
    const response = await axios.delete(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

// ── ÓRDENES Y RESEÑAS ──────────────────────
app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const orderWithUser = { ...req.body, customerId: req.user.userId || req.user.id };
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, orderWithUser);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error creando pedido" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const response = await axios.post(`${REVIEW_SERVICE_URL}/reviews`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error creando reseña" });
  }
});

app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    // Redirigimos la petición al microservicio de órdenes (Puerto 5000)
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    res.json(response.data);
  } catch (error) {
    console.error("Error al obtener órdenes del microservicio:", error.message);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
});

app.get("/api/reviews/:product_id", async (req, res) => {
  try {
    const response = await axios.get(`${REVIEW_SERVICE_URL}/reviews/${req.params.product_id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo reseñas" });
  }
});

module.exports = app;

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectRedis();
  } catch (err) {
    console.error("⚠️  Gateway: Redis no disponible al arrancar:", err.message);
  }
  if (process.env.RABBITMQ_URL) {
    connectRabbit().catch(() => {});
  }
  app.listen(PORT, () => {
    console.log(`API Gateway escuchando en puerto ${PORT}`);
  });
}

start();