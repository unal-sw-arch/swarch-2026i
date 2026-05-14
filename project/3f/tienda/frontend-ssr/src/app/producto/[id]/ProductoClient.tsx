"use client";
import { useState } from "react";
import Link from "next/link";
import StarRating from "../../../components/StarRating";
import { showToast } from "../../../components/Toast";
import { getCookie } from "cookies-next"; // Importante: para validar sesión
import { addToCart } from "../../../lib/api"; // Nueva función

const API = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
  : (process.env.API_URL || "http://api-gateway:3000");

export default function ProductoClient({ producto, reseñasIniciales }: { producto: any; reseñasIniciales: any[] }) {
  const [reseñas, setReseñas] = useState(reseñasIniciales);
  const [autor, setAutor] = useState("");
  const [comentario, setComentario] = useState("");
  const [estrellas, setEstrellas] = useState(0);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const imagenes = [producto.imagen1, producto.imagen2, producto.imagen3].filter(Boolean);

  async function agregarAlCarrito() {
    // 1. Obtenemos el token de la sesión
    const token = getCookie("token");

    // 2. Validación de Seguridad: Si no está logueado, no puede agregar al carrito
    if (!token) {
      showToast("Debes iniciar sesión para agregar productos al carrito 🔑", "warning");
      // Opcional: podrías redirigir al login
      window.location.href = "/login";
      return;
    }

    try {
      // 3. Llamada al API Gateway (que luego pasará el x-user-id al order-service)
      // Enviamos el ID del producto, la cantidad (1) y el token para validación
      const res = await addToCart(producto.id, 1, token as string);
      
      if (res) {
        showToast("Producto guardado en tu carrito de la nube 🛒", "success");
      } else {
        showToast("No se pudo guardar el producto en el servidor", "error");
      }
    } catch (error) {
      console.error("Error en la petición de carrito:", error);
      showToast("Error de conexión con el servicio de órdenes", "error");
    }
  }

  async function enviarReseña() {
    if (!autor || !comentario || estrellas === 0) {
      showToast("Completa todos los campos y selecciona las estrellas", "warning");
      return;
    }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      
      // 1. Enviar la reseña
      const postRes = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: producto.id, autor, comentario, estrellas }),
      });

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || "Error al guardar reseña");
      }

      // 2. Esperar un poco para asegurar persistencia en MongoDB
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Obtener reseñas actualizadas
      const getRes = await fetch(`${API_URL}/api/reviews/${producto.id}`);
      
      if (!getRes.ok) {
        throw new Error("Error al cargar reseñas actualizadas");
      }

      const reseñasActualizadas = await getRes.json();
      
      // Validar que sea un array
      if (Array.isArray(reseñasActualizadas)) {
        setReseñas(reseñasActualizadas);
      } else {
        console.warn("Respuesta inesperada de reseñas:", reseñasActualizadas);
        setReseñas([]);
      }

      // 4. Limpiar formulario
      setAutor(""); 
      setComentario(""); 
      setEstrellas(0);
      
      showToast("¡Reseña enviada, gracias! 🌟", "success");
    } catch (error) {
      console.error("Error en enviarReseña:", error);
      showToast(error instanceof Error ? error.message : "Error enviando reseña", "error");
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      <Link href="/"
        className="inline-flex items-center justify-center gap-2 fixed top-0 left-6 bg-yellow-400 hover:bg-yellow-500 text-white p-3 rounded-lg shadow-elevation-2 z-10 transition-all">
        ← Volver
      </Link>

      {/* Producto */}
      <div className="bg-white shadow-elevation-2 rounded-2xl p-6 md:p-8 border border-gray-100 mt-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{producto.nombre}</h2>
        <p className="text-gray-600 mb-8 text-lg">{producto.descripcion}</p>

        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-gray-100 rounded-xl overflow-hidden h-80 md:h-96 flex items-center justify-center">
              {imagenes.length > 0 ? (
                <img 
                  src={imagenes[0]} 
                  alt={producto.nombre}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                  onClick={() => setModalImg(imagenes[0])} 
                />
              ) : (
                <p className="text-gray-400">Sin imagen</p>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="space-y-3">
            {imagenes.map((img: string, i: number) => (
              <div
                key={i}
                onClick={() => setModalImg(img)}
                className="w-full aspect-square rounded-lg overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 cursor-pointer transition-all hover:scale-105"
              >
                <img 
                  src={img} 
                  alt={`${producto.nombre} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info y botón */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200 mb-8">
          <div>
            <p className="text-gray-600 text-sm mb-1">Precio</p>
            <p className="text-4xl font-bold text-yellow-600">${producto.precio.toFixed(2)}</p>
          </div>
          <button onClick={agregarAlCarrito}
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-8 rounded-lg shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 active:scale-95 text-lg">
            Agregar al carrito 🛒
          </button>
        </div>
      </div>

      {/* Reseñas */}
      <div className="mt-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8">Reseñas del producto</h3>
        
        {/* Lista de reseñas */}
        <div className="space-y-4 mb-10">
          {reseñas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-6xl mb-3">⭐</p>
              <p className="text-gray-500 text-lg">Aún no hay reseñas. ¡Sé el primero!</p>
            </div>
          ) : reseñas.map((r: any) => (
            <div key={r._id} className="bg-white rounded-xl shadow-elevation-1 hover:shadow-elevation-2 p-6 border border-gray-100 transition-all">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{r.autor}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < r.estrellas ? "text-yellow-400 text-lg" : "text-gray-300 text-lg"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium">{new Date(r.fecha).toLocaleDateString('es-ES')}</p>
              </div>
              <p className="text-gray-700 leading-relaxed">{r.comentario}</p>
            </div>
          ))}
        </div>

        {/* Formulario reseña */}
        <div className="bg-white rounded-2xl shadow-elevation-2 p-8 border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-900 mb-6">Deja tu reseña ✍️</h4>
          
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tu nombre</label>
              <input 
                value={autor} 
                onChange={e => setAutor(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tu reseña</label>
              <textarea 
                value={comentario} 
                onChange={e => setComentario(e.target.value)}
                placeholder="¿Qué te pareció el producto? Sé honesto y detallado"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all bg-white resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-3">Calificación</label>
              <StarRating onChange={setEstrellas} />
            </div>

            <button 
              onClick={enviarReseña}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 active:scale-95"
            >
              Enviar reseña 🌟
            </button>
          </div>
        </div>
      </div>

      {/* Modal imagen */}
      {modalImg && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setModalImg(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img 
              src={modalImg} 
              alt="Ampliada" 
              className="w-full h-auto rounded-lg shadow-elevation-3"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setModalImg(null)}
              className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-900 w-10 h-10 rounded-full flex items-center justify-center shadow-elevation-2 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}