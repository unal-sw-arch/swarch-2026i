"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";
import { showToast } from "../../components/Toast";
// MODIFICACIÓN: Importaciones para manejar la sesión y la API persistente
import { getCookie } from "cookies-next";
import { getCart, addToCart, removeFromCart, getProductos } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  // MODIFICACIÓN: Estado para manejar la carga de datos
  const [loading, setLoading] = useState(true);
  const token = getCookie("token");

  // MODIFICACIÓN: El useEffect ahora dispara la carga enriquecida desde el servidor
  useEffect(() => {
    if (token) {
      cargarCarritoCompleto();
    } else {
      setLoading(false);
    }
  }, [token]);

  // CREACIÓN: Función que cruza los IDs de tu carrito (Postgres) con los detalles del catálogo
  async function cargarCarritoCompleto() {
    try {
      // 1. Obtener items básicos (product_id y cantidad) del microservicio de órdenes
      const itemsDB = await getCart(token as string); 
      
      // 2. Obtener lista completa de productos para extraer nombres, precios e imágenes
      const catalogo = await getProductos(); 

      // 3. Enriquecimiento: Mapeamos los items de la DB con la info del catálogo
      const carritoConDatos = (itemsDB || []).map((itemDB: any) => {
        const productoInfo = catalogo.find((p: any) => String(p.id) === String(itemDB.product_id));
        
        return {
          ...itemDB,
          nombre: productoInfo ? productoInfo.nombre : `Producto #${itemDB.product_id}`,
          precio_unitario: productoInfo ? productoInfo.precio : 0,
          imagen1: productoInfo ? productoInfo.imagen1 : null,
          stock: productoInfo ? productoInfo.stock : 0
        };
      });

      setCarrito(carritoConDatos);
    } catch (error) {
      showToast("Error al sincronizar el carrito", "error");
    } finally {
      setLoading(false);
    }
  }

  // MODIFICACIÓN: Ahora las funciones de guardado actualizan el estado en el servidor
  async function guardarCambioCantidad(productId: number, cambio: number) {
    try {
      await addToCart(productId, cambio, token as string);
      await cargarCarritoCompleto(); // Recargamos para ver datos frescos
    } catch {
      showToast("No se pudo actualizar la cantidad", "error");
    }
  }

  async function cambiarCantidad(index: number, cambio: number) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + cambio;
    
    // Validación de stock mantenida del original
    if (nuevaCantidad > item.stock) {
      showToast(`Solo hay ${item.stock} unidades de "${item.nombre}"`, "warning");
      return;
    }

    if (nuevaCantidad <= 0) {
      confirmarEliminar(index);
    } else {
      await guardarCambioCantidad(item.product_id, cambio);
    }
  }

  function confirmarEliminar(index: number) { setConfirmIndex(index); }

  // MODIFICACIÓN: Elimina el registro físico en la base de datos de PostgreSQL
  async function eliminarItem() {
    if (confirmIndex === null) return;
    const item = carrito[confirmIndex];
    try {
      await removeFromCart(item.product_id, token as string);
      showToast("Producto eliminado del carrito", "info");
      setConfirmIndex(null);
      await cargarCarritoCompleto();
    } catch {
      showToast("Error al eliminar el producto", "error");
    }
  }

  async function finalizarCompra() {
    if (carrito.length === 0) { showToast("Tu carrito está vacío", "warning"); return; }
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ items: carrito }),
      });
      if (!res.ok) throw new Error();

      // Limpieza del carrito en la base de datos tras la compra
      for (const item of carrito) {
        await removeFromCart(item.product_id, token as string);
      }

      showToast("¡Compra realizada correctamente! 🎉", "success");
      setCarrito([]);
    } catch {
      showToast("Error procesando la compra", "error");
    }
  }

  // MODIFICACIÓN: Bloque de seguridad para obligar al login
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-yellow-50">
        <div className="max-w-md w-full bg-white shadow-elevation-3 rounded-2xl p-8 text-center border-t-4 border-yellow-400">
          <p className="text-6xl mb-6">🔑</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Logéate primero!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">Tu carrito es personal y persistente. Inicia sesión para ver tus productos guardados.</p>
          <Link href="/login" className="inline-block w-full bg-yellow-400 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold shadow-elevation-2 transition-all duration-200 hover:shadow-elevation-3">
            Ingresar
          </Link>
        </div>
      </main>
    );
  }

  if (loading) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-6xl mb-4 animate-bounce">🎁</p>
        <p className="text-gray-600 font-semibold">Cargando tus regalos...</p>
      </div>
    </main>
  );

  // Cálculo del total corregido para evitar el NaN
  const total = carrito.reduce((s, i) => s + (i.precio_unitario * i.cantidad), 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-yellow-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER ELEGANTE */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">🛍️ Tu Carrito de Compras</h1>
          <p className="text-gray-600 text-lg">Revisa tus productos antes de finalizar</p>
        </div>

        {carrito.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-elevation-2 border-2 border-dashed border-gray-200">
            <p className="text-8xl mb-6 animate-bounce">🛒</p>
            <p className="text-2xl text-gray-700 font-bold mb-3">Tu carrito está vacío</p>
            <p className="text-gray-600 mb-10">¡Añade algunos regalos especiales a tu carrito!</p>
            <Link href="/" className="inline-block bg-gradient-to-r from-yellow-400 to-amber-400 text-white px-10 py-4 rounded-lg font-bold shadow-elevation-2 hover:shadow-elevation-3 transition-all hover:scale-105">
              ← Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITEMS - PARTE PRINCIPAL */}
            <div className="lg:col-span-2 space-y-5">
              {/* Contador de items */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Productos en tu carrito</span>
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg">{carrito.length}</span>
              </div>

              {/* Items */}
              {carrito.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-200">
                  <div className="p-6">
                    <div className="flex gap-6 flex-col sm:flex-row">
                      {/* Imagen */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img src={item.imagen1 || ""} alt={item.nombre}
                            className="w-28 h-28 object-cover rounded-xl shadow-elevation-1"
                            onError={(e: any) => e.target.style.display = "none"} />
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ×{item.cantidad}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido Principal */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2 className="font-bold text-gray-900 text-xl mb-2">{item.nombre}</h2>
                          <div className="flex items-baseline gap-3 mb-3">
                            <p className="text-yellow-600 font-bold text-2xl">${item.precio_unitario.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              Stock: <span className="font-semibold text-gray-700">{item.stock}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                            <button onClick={() => cambiarCantidad(i, -1)}
                              className="bg-red-500 hover:bg-red-600 w-10 h-10 rounded-md text-white font-bold text-xl transition-all active:scale-90 shadow-elevation-1">
                              −
                            </button>
                            <span className="font-bold text-lg w-8 text-center text-gray-900">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(i, 1)}
                              className="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-md text-white font-bold text-xl transition-all active:scale-90 shadow-elevation-1">
                              +
                            </button>
                          </div>

                          {/* Total item */}
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                            <p className="font-bold text-gray-900 text-2xl">${(item.precio_unitario * item.cantidad).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Eliminar */}
                      <div className="flex justify-end sm:justify-start">
                        <button onClick={() => confirmarEliminar(i)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-lg transition-all font-semibold text-sm border border-red-200 hover:border-red-500">
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RESUMEN - PARTE DERECHA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-3 border-yellow-300 rounded-3xl p-8 shadow-elevation-3">
                {/* Título */}
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center pb-6 border-b-2 border-yellow-200">
                  📋 Resumen de Compra
                </h3>
                
                {/* Detalles */}
                <div className="space-y-4 mb-8 pb-8 border-b-2 border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900 text-lg">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Impuestos</span>
                    <span className="font-bold text-gray-900 text-lg">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-100 px-4 py-3 rounded-lg border border-green-300">
                    <span className="text-green-700 font-bold">🚚 Envío</span>
                    <span className="font-bold text-green-700">¡GRATIS!</span>
                  </div>
                </div>

                {/* Total Grande */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm mb-2 font-medium">TOTAL A PAGAR</p>
                  <p className="text-5xl font-bold text-yellow-600 drop-shadow-lg">${total.toFixed(2)}</p>
                </div>

                {/* Botón Principal */}
                <button onClick={finalizarCompra}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-elevation-3 hover:shadow-elevation-4 transition-all duration-300 active:scale-95 text-lg mb-4">
                  ✨ Finalizar Compra
                </button>

                {/* Info adicional */}
                <div className="bg-white bg-opacity-70 rounded-lg p-4 text-center text-sm">
                  <p className="text-gray-600">
                    <span className="font-bold text-gray-900">{carrito.length}</span> artículo(s) en tu carrito
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Pago seguro garantizado 🔒
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmIndex !== null && (
        <ConfirmModal
          mensaje="¿Eliminar este producto del carrito?"
          onConfirm={eliminarItem}
          onCancel={() => setConfirmIndex(null)} />
      )}
    </main>
  );
}