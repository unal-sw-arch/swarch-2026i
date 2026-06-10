let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const container = document.getElementById("carritoContainer");
const API = "https://api-gateway-gilt-nu.vercel.app";

// ── SISTEMA DE NOTIFICACIONES ─────────────────────────────
function showToast(mensaje, tipo = "info") {
  const colores = {
    success: "bg-green-500",
    error:   "bg-red-400",
    warning: "bg-yellow-400",
    info:    "bg-gray-700"
  };

  const iconos = {
    success: "✅",
    error:   "❌",
    warning: "⚠️",
    info:    "ℹ️"
  };

  const toast = document.createElement("div");
  toast.className = `
    fixed top-6 right-6 z-50
    ${colores[tipo]} text-white
    px-5 py-4 rounded-xl shadow-xl
    flex items-center gap-3
    text-sm font-semibold
    transition-all duration-300 opacity-0 translate-x-4
    max-w-sm
  `;
  toast.innerHTML = `
    <span class="text-xl">${iconos[tipo]}</span>
    <span>${mensaje}</span>
  `;

  document.body.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  });

  // Animar salida y eliminar
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(16px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── MODAL DE CONFIRMACIÓN ─────────────────────────────────
function showConfirm(mensaje) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = `
      fixed inset-0 bg-black bg-opacity-40 z-50
      flex items-center justify-center
    `;
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <p class="text-5xl mb-4">🛒</p>
        <p class="text-gray-700 font-semibold text-lg mb-6">${mensaje}</p>
        <div class="flex gap-3 justify-center">
          <button id="confirmNo"
            class="px-6 py-2 rounded-xl border border-gray-200 text-gray-500
                   hover:bg-gray-50 font-semibold transition">
            Cancelar
          </button>
          <button id="confirmSi"
            class="px-6 py-2 rounded-xl bg-red-400 hover:bg-red-500
                   text-white font-semibold transition">
            Eliminar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("confirmSi").addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });
    document.getElementById("confirmNo").addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
  });
}

// ── RENDER CARRITO ────────────────────────────────────────
function renderCarrito() {
  container.innerHTML = "";

  if (carrito.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-6xl mb-4">🛒</p>
        <p class="text-gray-500 text-lg">Tu carrito está vacío</p>
        <a href="index.html"
          class="mt-4 inline-block bg-yellow-400 text-white px-6 py-2 rounded-lg">
          Ver productos
        </a>
      </div>`;
    return;
  }

  let totalGeneral = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio_unitario * item.cantidad;
    totalGeneral += subtotal;

    container.innerHTML += `
      <div class="bg-white p-4 mb-4 rounded-xl shadow flex gap-4 items-center">
        <img src="${item.imagen1 || ''}"
          class="w-20 h-20 object-cover rounded-lg"
          onerror="this.style.display='none'">

        <div class="flex-1">
          <h2 class="font-bold text-gray-800">${item.nombre}</h2>
          <p class="text-yellow-500 font-semibold">$${item.precio_unitario}</p>
          <p class="text-xs text-gray-400">Stock disponible: ${item.stock}</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="cambiarCantidad(${index}, -1)"
            class="bg-red-400 hover:bg-red-500 w-8 h-8 rounded-full text-white font-bold">−</button>
          <span class="font-bold text-lg w-6 text-center">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)"
            class="bg-green-400 hover:bg-green-500 w-8 h-8 rounded-full text-white font-bold">+</button>
        </div>

        <div class="text-right min-w-[80px]">
          <p class="font-bold text-gray-700">$${subtotal}</p>
          <button onclick="eliminarItem(${index})"
            class="text-xs text-red-400 hover:underline mt-1">Eliminar</button>
        </div>
      </div>`;
  });

  container.innerHTML += `
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 text-right">
      <p class="text-gray-500 text-sm">Total a pagar</p>
      <p class="text-3xl font-bold text-yellow-500">$${totalGeneral}</p>
    </div>`;
}

// ── FUNCIONES ─────────────────────────────────────────────
function cambiarCantidad(index, cambio) {
  const item = carrito[index];
  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad > item.stock) {
    showToast(`Solo hay ${item.stock} unidades de "${item.nombre}"`, "warning");
    return;
  }

  if (nuevaCantidad <= 0) {
    carrito.splice(index, 1);
  } else {
    carrito[index].cantidad = nuevaCantidad;
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
}

async function eliminarItem(index) {
  const confirmar = await showConfirm("¿Eliminar este producto del carrito?");
  if (!confirmar) return;

  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
  showToast("Producto eliminado del carrito", "info");
}

document.getElementById("finalizarCompra").addEventListener("click", async () => {
  if (carrito.length === 0) {
    showToast("Tu carrito está vacío", "warning");
    return;
  }

  try {
    const response = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: carrito })
    });

    if (!response.ok) throw new Error("Error creando orden");

    for (const item of carrito) {
      await fetch(`${API}/api/products/${item.product_id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: item.cantidad })
      });
    }

    showToast("¡Compra realizada correctamente! 🎉", "success");

    localStorage.removeItem("carrito");
    carrito = [];
    setTimeout(() => renderCarrito(), 1000);

  } catch (error) {
    showToast("Error procesando la compra", "error");
  }
});

renderCarrito();