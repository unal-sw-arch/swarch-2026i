const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      }
    : {
        host: process.env.DB_HOST || "postgres",
        user: process.env.DB_USER || "admin",
        password: process.env.DB_PASSWORD || "admin",
        database: process.env.DB_NAME || "giftshop",
        port: process.env.DB_PORT || 5432,
      }
);


async function waitForDB() {
// ✅ Inicializar tabla una sola vez al arrancar
  let connected = false;
  while (!connected) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      console.log("Conectado a PostgreSQL");
    } catch (error) {
      console.log("Esperando a PostgreSQL...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

async function initDB() {
  await waitForDB();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255),
        descripcion TEXT,
        precio INTEGER,
        stock INTEGER DEFAULT 0,
        imagen1 TEXT,
        imagen2 TEXT,
        imagen3 TEXT
      );
    `);
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
    `);
    console.log("Tabla products lista");
  } catch (error) {
    console.error("Error inicializando DB:", error.message);
  }
}

initDB();

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error GET products:", error.message);
    res.status(500).json({ error: error.message }); // ✅ mensaje real
  }
});

app.post("/products", async (req, res) => {
  const { nombre, descripcion, precio, stock, imagen1, imagen2, imagen3 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (nombre, descripcion, precio, stock, imagen1, imagen2, imagen3)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nombre, descripcion, parseFloat(precio), parseInt(stock) || 0, imagen1, imagen2, imagen3]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error POST products:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/products/:id", async (req, res) => {
  const { precio } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE products SET precio=$1 WHERE id=$2 RETURNING *",
      [precio, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error PUT products:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/products/:id/stock", async (req, res) => {
  const { cantidad } = req.body;
  const { id } = req.params;
  try {
    const check = await pool.query("SELECT stock FROM products WHERE id=$1", [id]);
    if (check.rows[0].stock < cantidad) {
      return res.status(400).json({ error: "Stock insuficiente" });
    }
    const result = await pool.query(
      "UPDATE products SET stock = stock - $1 WHERE id=$2 RETURNING *",
      [cantidad, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error PUT stock:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error DELETE products:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;

// Start server when run as main
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Product service listening on port ${PORT}`);
});