"use client";
import { ReactNode, useState, useEffect } from "react";
import "./globals.css";
import Link from "next/link";
import ToastContainer from "../components/Toast";
import { getCookie, deleteCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ role: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const token = getCookie("token");

  useEffect(() => {
    setMounted(true);
    if (token) {
      try {
        const decoded: any = jwtDecode(token as string);
        setSession(decoded);
      } catch {
        setSession(null);
      }
    }
  }, [token]);

  const handleLogout = () => {
    deleteCookie("token");
    window.location.href = "/";
  };

  return (
    <html lang="es">
      <body className="bg-pink-50 text-gray-800">
        
        {/* TOP BAR - INFO PROMOCIONAL */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-2 text-sm font-medium">
          <p>🎉 Envío gratis en compras mayores a $50.000 · Llama: <a href="tel:+573005554942" className="font-bold hover:underline">+57 300 555 4942</a></p>
        </div>

        {/* HEADER PRO */}
        <header className="bg-yellow-400 shadow-elevation-2 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 relative flex items-center justify-between">
            
            {/* BLOQUE IZQUIERDA (vacío para centrar visualmente) */}
            <div className="w-1/3 hidden md:block" />

            {/* MARCA CENTRADA */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-center hover:opacity-90 transition-opacity"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Boutique de Regalos
              </h1>
              <p className="text-xs sm:text-sm text-yellow-100 font-medium">
                Villapinzón · By Nancy Lopez
              </p>
            </Link>

            {/* ACCIONES DERECHA */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Carrito */}
              <Link
                href="/carrito"
                className="inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-900 px-3 sm:px-4 py-2 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 hover:scale-105 transition-all font-semibold text-sm"
              >
                🛒 <span className="hidden sm:inline">Carrito</span>
              </Link>

              {mounted && (
                <>
                  {/* Admin */}
                  {session && Number(session.role) === 1 && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1 sm:gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 hover:bg-red-600 hover:scale-105 transition-all font-semibold text-sm"
                    >
                      ⚙️ <span className="hidden sm:inline">Admin</span>
                    </Link>
                  )}

                  {token ? (
                    <>
                      {/* Perfil */}
                      <Link
                        href="/perfil"
                        className="inline-flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 hover:bg-blue-600 hover:scale-105 transition-all font-semibold text-sm"
                      >
                        👤 <span className="hidden sm:inline">Perfil</span>
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1 sm:gap-2 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 hover:bg-gray-700 hover:scale-105 transition-all font-semibold text-sm active:scale-95"
                      >
                        ✕ <span className="hidden sm:inline">Salir</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 sm:gap-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 hover:bg-green-600 hover:scale-105 transition-all font-semibold text-sm"
                    >
                      🔑 <span className="hidden sm:inline">Login</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </header>


        {/* CONTENIDO */}
        {children}

        {/* TOAST */}
        <ToastContainer />
      </body>
    </html>
  );
}
