import { getProductos } from "../lib/api";
import Link from "next/link";
import ImageWithFallback from "../components/ImageWithFallback";

export default async function Home() {
  let productos: any[] = [];
  try {
    productos = await getProductos();
  } catch {
    productos = [];
  }

  // Destacados: primeros 4 productos
  const destacados = productos.slice(0, 4);

  return (
    <>
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎁 Regalos Únicos y Artesanales
          </h2>
          <p className="text-lg sm:text-xl text-white opacity-95 mb-8 max-w-2xl mx-auto">
            Encuentra el regalo perfecto para cada ocasión. Productos hechos con amor en Villapinzón
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#productos" className="bg-white text-yellow-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 shadow-elevation-2 transition-all hover:shadow-elevation-3">
              Explorar Catálogo
            </a>
            <a href="https://wa.me/573005554942" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-600 shadow-elevation-2 transition-all hover:shadow-elevation-3">
              Chatear en WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Artesanal</h3>
              <p className="text-gray-600 text-sm">Productos hechos a mano con atención al detalle</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Rápido y Fácil</h3>
              <p className="text-gray-600 text-sm">Compra online y retira en tienda o con envío</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Con Pasión</h3>
              <p className="text-gray-600 text-sm">Cada regalo es seleccionado con amor</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {destacados.length > 0 && (
        <section className="bg-gradient-to-b from-pink-50 to-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">✨ Destacados</h2>
              <p className="text-gray-600">Los favoritos de nuestros clientes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {destacados.map((p: any) => (
                <Link 
                  key={p.id}
                  href={`/producto/${p.id}`}
                  className="group relative"
                >
                  <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 hover:border-yellow-200 transition-all duration-300 flex flex-col h-full hover-lift">
                    <div className="absolute top-3 right-3 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      ⭐ Favorito
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-yellow-50 h-48">
                      <ImageWithFallback
                        src={p.imagen1 ? encodeURI(p.imagen1.startsWith("/") ? p.imagen1 : `/${p.imagen1}`) : undefined}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-yellow-600 transition-colors">
                        {p.nombre}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{p.descripcion}</p>
                      <div className="flex items-baseline justify-between mt-auto pt-3 border-t border-gray-100">
                        <p className="text-lg font-bold text-gray-900">${p.precio}</p>
                        <span className="text-xs text-yellow-600 font-medium">Ver →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TODOS LOS PRODUCTOS */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8" id="productos">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Catálogo Completo
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Todos nuestros regalos artesanales
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
          {productos.map((p: any) => (
            <Link 
              key={p.id}
              href={`/producto/${p.id}`}
              className="group"
            >
              <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 hover:border-yellow-200 transition-all duration-300 flex flex-col h-full hover-lift">
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-yellow-50 h-52">
                  <ImageWithFallback
                    src={p.imagen1 ? encodeURI(p.imagen1.startsWith("/") ? p.imagen1 : `/${p.imagen1}`) : undefined}
                    alt={p.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-yellow-600 transition-colors">
                    {p.nombre}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {p.descripcion}
                  </p>
                  <div className="flex items-baseline justify-between mt-auto pt-3 border-t border-gray-100">
                    <p className="text-xl font-bold text-gray-900">${p.precio}</p>
                    <span className="text-xs text-yellow-600 font-medium">Ver →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {productos.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg text-gray-600 font-medium mb-2">No hay productos disponibles</p>
              <p className="text-gray-500 text-sm">Vuelve pronto para descubrir nuestros artículos</p>
            </div>
          )}
        </div>
      </main>

      {/* SECCIÓN DE TESTIMONIOS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">💬 Lo que Dicen Nuestros Clientes</h2>
            <p className="text-gray-600">Opiniones de personas que ya han comprado con nosotros</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "María García", text: "Productos de excelente calidad, muy bien presentados. ¡Recomendado!" },
              { name: "Juan Pérez", text: "El mejor lugar para comprar regalos artesanales. Muy personalizado." },
              { name: "Ana López", text: "Atención excepcional y regalos hermosos. Vuelvo a comprar seguro." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-elevation-1 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-bold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER MEJORADO */}
      <footer className="bg-gray-900 text-gray-200 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Sobre nosotros */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">🎁 Boutique de Regalos</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Somos una tienda de regalos artesanales con pasión por encontrar los presentes perfectos para cada ocasión.
              </p>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">📞 Contacto</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="https://www.google.com/maps/place/Boutique+de+Regalos+Villapinz%C3%B3n/@5.2154062,-73.5973877,80m/data=!3m1!1e3!4m9!1m2!2m1!1sCra.+5+%23+3-19!3m5!1s0x8e402336a8101291:0x1f09a717d5538beb!8m2!3d5.215484!4d-73.597462!16s%2Fg%2F11zkhv3tws?entry=ttu" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors block">
                  📍 Carrera 5 # 3-15, Villapinzón
                </a>
                <a href="https://wa.me/573005554942" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                  💬 +57 300 555 4942
                </a>
                <p>📧 info@boutiquederg.com</p>
              </div>
            </div>

            {/* Enlaces */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Enlaces</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="hover:text-yellow-400 transition-colors block">Inicio</a>
                <a href="#productos" className="hover:text-yellow-400 transition-colors block">Catálogo</a>
                <a href="#" className="hover:text-yellow-400 transition-colors block">Sobre Nosotros</a>
                <a href="#" className="hover:text-yellow-400 transition-colors block">Política de Privacidad</a>
              </div>
            </div>

            {/* Síguenos */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Síguenos</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="hover:text-yellow-400 transition-colors block">📘 Facebook</a>
                <a href="#" className="hover:text-yellow-400 transition-colors block">📷 Instagram</a>
                <a href="#" className="hover:text-yellow-400 transition-colors block">🎥 TikTok</a>
                <a href="#" className="hover:text-yellow-400 transition-colors block">🐦 Twitter</a>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-gray-700 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <p>© {new Date().getFullYear()} <span className="text-yellow-400 font-bold">Boutique de Regalos</span> · Todos los derechos reservados</p>
              <div className="flex gap-6 md:justify-end">
                <a href="#" className="hover:text-yellow-400 transition-colors">Términos de Servicio</a>
                <a href="#" className="hover:text-yellow-400 transition-colors">Política de Devoluciones</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
