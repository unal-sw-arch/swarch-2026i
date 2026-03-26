const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "admin",
  host: "postgres",
  database: "giftshop",
  password: "admin",
  port: 5432,
});

async function waitForDB() {
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

    // ✅ Si la tabla ya existía sin stock, agregar la columna
    await pool.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
    `);

    console.log("Tabla products lista");
  } catch (error) {
    console.error("Error inicializando DB:", error);
  }
}

initDB();

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});

app.post("/products", async (req, res) => {
  const { nombre, descripcion, precio, stock, imagen1, imagen2, imagen3 } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (nombre, descripcion, precio, stock, imagen1, imagen2, imagen3)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [nombre, descripcion, parseFloat(precio), parseInt(stock) || 0, imagen1, imagen2, imagen3]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error detallado:", error.message);
    res.status(500).json({ error: "Error creando producto", detalle: error.message });
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
    res.status(500).json({ error: "Error actualizando precio" });
  }
});

// ✅ Nueva ruta: descontar stock al confirmar compra
app.put("/products/:id/stock", async (req, res) => {
  const { cantidad } = req.body;
  const { id } = req.params;
  try {
    // Verificar stock disponible
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
    res.status(500).json({ error: "Error actualizando stock" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

app.listen(4000, () => {
  console.log("Product Service en puerto 4000");
});