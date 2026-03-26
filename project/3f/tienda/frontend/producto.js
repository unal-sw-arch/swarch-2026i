const params = new URLSearchParams(window.location.search);
const idProducto = parseInt(params.get("id"));

if (!idProducto) {
  document.getElementById("producto").innerHTML =
    `<p class="text-center text-red-500 text-xl">Producto no encontrado</p>`;
}

// ── RESEÑAS ──────────────────────────────────────────

function cargarReseñas(productId) {
  fetch(`http://localhost:3000/api/reviews/${productId}`)
    .then(res => res.json())
    .then(reviews => {
      const contenedor = document.getElementById("listaReseñas");
      if (reviews.length === 0) {
        contenedor.innerHTML = `
          <p class="text-gray-400 text-center py-4">
            Aún no hay reseñas. ¡Sé el primero! 🌟
          </p>`;
        return;
      }
      contenedor.innerHTML = reviews.map(r => `
        <div class="bg-white rounded-xl shadow p-4">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800">${r.autor}</p>
              <p class="text-yellow-400 text-lg">${"★".repeat(r.estrellas)}${"☆".repeat(5 - r.estrellas)}</p>
            </div>
            <p class="text-xs text-gray-400">${new Date(r.fecha).toLocaleDateString()}</p>
          </div>
          <p class="text-gray-600 mt-2">${r.comentario}</p>
        </div>
      `).join("");
    })
    .catch(err => console.error("Error cargando reseñas:", err));
}

function enviarReseña() {
  const autor = document.getElementById("autorReseña").value.trim();
  const comentario = document.getElementById("comentarioReseña").value.trim();
  const estrellas = parseInt(document.getElementById("estrellasReseña").value);

  if (!autor || !comentario || estrellas === 0) {
    alert("⚠️ Completa todos los campos y selecciona las estrellas");
    return;
  }

  fetch("http://localhost:3000/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: idProducto, autor, comentario, estrellas })
  })
  .then(res => res.json())
  .then(() => {
    alert("✅ Reseña enviada, ¡gracias!");
    document.getElementById("autorReseña").value = "";
    document.getElementById("comentarioReseña").value = "";
    document.getElementById("estrellasReseña").value = "0";
    document.querySelectorAll(".star").forEach(s => {
      s.textContent = "☆";
      s.style.color = "#9CA3AF";
    });
    cargarReseñas(idProducto);
  })
  .catch(() => alert("❌ Error enviando reseña"));
}

// ── Selector de estrellas ──────────────────────────────
const estrellas = document.querySelectorAll(".star");

estrellas.forEach(star => {
  star.addEventListener("mouseover", () => {
    const valor = parseInt(star.dataset.valor);
    estrellas.forEach(s => {
      s.textContent = parseInt(s.dataset.valor) <= valor ? "★" : "☆";
      s.style.color = parseInt(s.dataset.valor) <= valor ? "#FBBF24" : "#9CA3AF";
    });
  });

  star.addEventListener("click", () => {
    document.getElementById("estrellasReseña").value = star.dataset.valor;
  });

  star.addEventListener("mouseleave", () => {
    const seleccionado = parseInt(document.getElementById("estrellasReseña").value);
    estrellas.forEach(s => {
      s.textContent = parseInt(s.dataset.valor) <= seleccionado ? "★" : "☆";
      s.style.color = parseInt(s.dataset.valor) <= seleccionado ? "#FBBF24" : "#9CA3AF";
    });
  });
});

// ── Producto ──────────────────────────────────────────

fetch('http://localhost:3000/api/products')
  .then(response => response.json())
  .then(productos => {
    const producto = productos.find(p => p.id === idProducto);
    const contenedor = document.getElementById('producto');

    if (!producto) {
      contenedor.innerHTML =
        `<p class="text-center text-red-500 text-xl">Producto no encontrado</p>`;
      return;
    }

    const imagenes = [producto.imagen1, producto.imagen2, producto.imagen3].filter(Boolean);
    const galeria = imagenes.map(img => `
      <img src="${img}"
           class="w-1/3 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
    `).join("");

    contenedor.innerHTML = `
      <div class="bg-white shadow-lg rounded-xl p-6">
        <h2 class="text-3xl font-bold text-yellow-500 mb-4">${producto.nombre}</h2>
        <div class="flex flex-wrap gap-4 justify-center mb-6">${galeria}</div>
        <p class="text-gray-700 mb-4">${producto.descripcion}</p>
        <p class="text-2xl font-bold mb-6">$${producto.precio}</p>
        <button id="agregarCarrito"
          class="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg shadow">
          Agregar al carrito 🛒
        </button>
      </div>
    `;

    // Modal imágenes
    const modal = document.getElementById('modalImagen');
    const imagenAmpliada = document.getElementById('imagenAmpliada');

    contenedor.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', () => {
        imagenAmpliada.src = img.src;
        modal.classList.remove('hidden');
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    // Agregar al carrito
    document.getElementById("agregarCarrito").addEventListener("click", () => {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const itemExistente = carrito.find(item => item.product_id === producto.id);

      if (itemExistente) {
        if (itemExistente.cantidad >= producto.stock) {
          alert(`⚠️ Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`);
          return;
        }
        itemExistente.cantidad += 1;
      } else {
        if (producto.stock <= 0) {
          alert(`❌ "${producto.nombre}" está agotado`);
          return;
        }
        carrito.push({
          product_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio,
          stock: producto.stock,
          imagen1: producto.imagen1,
          cantidad: 1
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert("Producto agregado al carrito 🛒");
    });

    // ✅ Cargar reseñas AQUÍ, al final del then, fuera de cualquier listener
    cargarReseñas(idProducto);
  })
  .catch(error => {
    console.error("Error cargando producto:", error);
    document.getElementById("producto").innerHTML =
      `<p class="text-center text-red-500 text-xl">Error cargando producto</p>`;
  });