fetch("http://localhost:3000/api/orders")
.then(res => res.json())
.then(data => {

const orders = data.orders
const items = data.items

// TOTAL VENTAS
let totalVentas = 0

orders.forEach(o => {
    totalVentas += o.total
})

document.getElementById("totalVentas").innerText = "$" + totalVentas


// NUMERO ORDENES
document.getElementById("numOrdenes").innerText = orders.length


// TABLA ORDENES
const tabla = document.getElementById("tablaOrdenes")

orders.forEach(o => {

tabla.innerHTML += `
  <tr class="hover:bg-pink-50 transition">
    <td class="p-3 text-gray-500">#${o.id}</td>
    <td class="p-3">${new Date(o.fecha).toLocaleString()}</td>
    <td class="p-3 font-semibold text-green-500">$${o.total}</td>
  </tr>
`;

})


// PRODUCTOS VENDIDOS

const productosVendidos = {}

items.forEach(i => {

if(!productosVendidos[i.product_id]){
productosVendidos[i.product_id] = 0
}

productosVendidos[i.product_id] += i.cantidad

})


const labels = Object.keys(productosVendidos)
const valores = Object.values(productosVendidos)

const ctx = document.getElementById("graficaProductos")

new Chart(ctx, {

type: "bar",

data: {
labels: labels,
datasets: [{
label: "Cantidad vendida",
data: valores
}]
}

})

})


fetch("http://localhost:3000/api/products")
  .then(res => res.json())
  .then(productos => {

    const contenedor = document.getElementById("listaProductos");

    productos.forEach(p => {

      const div = document.createElement("div");

      div.className =
        "bg-white shadow p-4 rounded flex justify-between items-center";

      div.innerHTML = `
        <div>
          <p class="font-semibold text-gray-800">${p.nombre}</p>
          <p class="text-yellow-500 font-bold">$${p.precio}</p>
          <p class="text-xs mt-1 ${p.stock <= 5 ? 'text-red-400' : 'text-gray-400'}">
            Stock: ${p.stock} unidades ${p.stock <= 5 ? '⚠️' : '✅'}
          </p>
        </div>
        <div class="space-x-2">
          <button onclick="cambiarPrecio(${p.id})"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm">
            Editar precio
          </button>
          <button onclick="eliminarProducto(${p.id})"
            class="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-sm">
            Eliminar
          </button>
        </div>
      `;

      contenedor.appendChild(div);
    });

  });

  //Funcion cambiar precio
  function cambiarPrecio(id) {

  const nuevoPrecio = prompt("Nuevo precio:");

  fetch(`http://localhost:3000/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ precio: nuevoPrecio })
  })
  .then(() => location.reload());

}

// Funcion eliminar producto
 function eliminarProducto(id) {

  if (!confirm("Eliminar producto?")) return;

  fetch(`http://localhost:3000/api/products/${id}`, {
    method: "DELETE"
  })
  .then(() => location.reload());

}

// Funcion agregar producto
function crearProducto() {
  const nombre = document.getElementById("nombreProducto").value.trim();
  const descripcion = document.getElementById("descripcionProducto").value.trim();
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const stock = parseInt(document.getElementById("stockProducto").value);
  const imagen1 = document.getElementById("imagen1").value.trim();
  const imagen2 = document.getElementById("imagen2").value.trim();
  const imagen3 = document.getElementById("imagen3").value.trim();

  if (!nombre || !precio) {
    alert("⚠️ Nombre y precio son obligatorios");
    return;
  }

  fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, descripcion, precio, stock, imagen1, imagen2, imagen3 })
  })
  .then(res => res.json())
  .then(data => {
    alert("✅ Producto creado correctamente");
    location.reload();
  })
  .catch(err => {
    alert("❌ Error creando producto");
  });
}