const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express(); // framework 
app.use(cors());
app.use(express.json());

const PRODUCT_SERVICE_URL = "http://product-service:4000";
const ORDER_SERVICE_URL = "http://order-service:5000";


// Ruta base
app.get("/", (req, res) => {
  res.send("API Gateway funcionando");
});

//Crear producto
app.post("/api/products", async (req, res) => {
  try {
    const response = await axios.post(
      `${PRODUCT_SERVICE_URL}/products`,
      req.body
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Error creando producto" });
  }
});


// Cambiar precio 
app.put("/api/products/:id", async (req, res) => {
  try {
    const response = await axios.put(
      `${PRODUCT_SERVICE_URL}/products/${req.params.id}`,
      req.body
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Error actualizando producto" });
  }
});


//Eloiminar producto
app.delete("/api/products/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${PRODUCT_SERVICE_URL}/products/${req.params.id}`
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: "Error eliminando producto" });
  }
});



// Obtener productos
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error("Error en products:", error.message);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});


// Crear orden
app.post("/api/orders", async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error en orders POST:", error.message);
    res.status(500).json({ error: "Error creando pedido" });
  }
});


// Obtener órdenes
app.get("/api/orders", async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    res.json(response.data);
  } catch (error) {
    console.error("Error en orders GET:", error.message);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
});


app.listen(3000, () => {
  console.log("API Gateway en puerto 3000");
});

//Stock 
app.put("/api/products/:id/stock", async (req, res) => {
  try {
    const response = await axios.put(
      `${PRODUCT_SERVICE_URL}/products/${req.params.id}/stock`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error actualizando stock" });
  }
});


//Review Service
const REVIEW_SERVICE_URL = "http://review-service:6000";

// Obtener reseñas de un producto
app.get("/api/reviews/:product_id", async (req, res) => {
  try {
    const response = await axios.get(
      `${REVIEW_SERVICE_URL}/reviews/${req.params.product_id}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo reseñas" });
  }
});

// Crear reseña
app.post("/api/reviews", async (req, res) => {
  try {
    const response = await axios.post(
      `${REVIEW_SERVICE_URL}/reviews`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error creando reseña" });
  }
});

// Eliminar reseña
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${REVIEW_SERVICE_URL}/reviews/${req.params.id}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error eliminando reseña" });
  }
});