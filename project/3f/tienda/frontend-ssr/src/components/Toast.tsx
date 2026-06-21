"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id: number;
  mensaje: string;
  tipo: ToastType;
}

let addToastFn: ((mensaje: string, tipo: ToastType) => void) | null = null;

export function showToast(mensaje: string, tipo: ToastType = "info") {
  if (addToastFn) addToastFn(mensaje, tipo);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToastFn = (mensaje, tipo) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, mensaje, tipo }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  const colores = {
    success: "bg-gradient-to-r from-green-400 to-emerald-500",
    error: "bg-gradient-to-r from-red-400 to-rose-500",
    warning: "bg-gradient-to-r from-yellow-400 to-amber-500",
    info: "bg-gradient-to-r from-blue-500 to-cyan-500",
  };

  const iconos = {
    success: "✅", error: "❌", warning: "⚠️", info: "ℹ️",
  };

  return (
    <div className="fixed top-6 left-1/2 sm:left-auto right-6 -translate-x-1/2 sm:translate-x-0 z-50 flex flex-col gap-3 items-center sm:items-end px-4 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`${colores[t.tipo]} text-white px-6 py-4 rounded-lg shadow-elevation-3 flex items-center gap-3 text-sm font-semibold max-w-sm w-full sm:w-auto animate-slide-in pointer-events-auto`}>
          <span className="text-lg flex-shrink-0">{iconos[t.tipo]}</span>
          <span className="flex-1">{t.mensaje}</span>
        </div>
      ))}
    </div>
  );
}