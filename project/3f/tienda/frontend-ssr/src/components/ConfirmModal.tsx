"use client";

interface Props {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ mensaje, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-elevation-3 p-8 max-w-sm w-full text-center animate-fade-in">
        <p className="text-6xl mb-6">🛒</p>
        <p className="text-gray-800 font-bold text-lg mb-2">{mensaje}</p>
        <p className="text-gray-500 text-sm mb-8">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 active:scale-95">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2 active:scale-95">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}