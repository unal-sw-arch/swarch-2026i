const API = "https://api-gateway-gilt-nu.vercel.app";
fetch(`${API}/api/products`)
  .then(response => response.json())
  .then(productos => {
    const contenedor = document.getElementById('productos');

    productos.forEach(p => {
      const card = `
        <!-- 👇 Se agregó onclick al contenedor -->
        <div onclick="window.location.href='producto.html?id=${p.id}'"
             class="cursor-pointer bg-white shadow-md rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200">
          <img src="${p.imagen1}" alt="${p.nombre}" 
               class="w-full h-48 object-cover" 
               onerror="this.onerror=null;this.src='https://via.placeholder.com/400x300?text=Imagen+no+disponible'">
          <div class="p-4">
            <h3 class="text-center font-semibold text-orange-500 font-body">${p.nombre}</h3>
            <p class="text-center text-gray-600 mb-2">${p.descripcion}</p>
            <p class="text-center font-bold text-gray-800 mb-3">$${p.precio}</p>
            <a href="https://wa.me/573005554942?text=Hola!%20Estoy%20interesado%20en%20el%20producto%20${encodeURIComponent(p.nombre)}"
              target="_blank"
              class="block bg-yellow-400 text-white text-center py-2 rounded-md hover:bg-yellow-200">
              Comprar
            </a>
          </div>
        </div>
      `;
      contenedor.innerHTML += card;
    });
  });