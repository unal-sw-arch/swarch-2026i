const faqs = [
  {
    q: "¿Cómo apruebo un nuevo restaurante?",
    a: "Ve a Usuarios y aprueba al rol Administrador de restaurante (FR-01.5).",
  },
  {
    q: "¿Cómo gestiono estados de orden?",
    a: "En Órdenes verifica Preparing, Ready, Served, Delivered o Cancelled (FR-05.4).",
  },
  {
    q: "¿Cómo se disparan las notificaciones?",
    a: "Reserva confirmada y recordatorio 30 min antes, orden lista, y reset de contraseña (FR-07, US-04).",
  },
  {
    q: "¿Dónde veo calificaciones?",
    a: "En Reportes encontrarás el resumen de ratings y comentarios (FR-06).",
  },
];

export const AdminHelpPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Ayuda</h1>
        <p className="text-gray-600">
          Guía rápida alineada a los requerimientos de los workshops.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        {faqs.map((item, idx) => (
          <div key={idx} className="py-2">
            <p className="font-semibold text-gray-900">{item.q}</p>
            <p className="text-sm text-gray-700 mt-1">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 space-y-2">
        <p className="font-semibold">Requisitos clave a vigilar</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Roles y permisos separados (Cliente, Admin restaurante, Mesero, Chef, Admin sistema).</li>
          <li>Aprobación de restaurantes y menús antes de publicar (FR-01.5, FR-02.3).</li>
          <li>Órdenes ligadas a reservas y estados en tiempo real (FR-05, US-17 a US-22).</li>
          <li>Recordatorios y notificaciones para reservas y órdenes (FR-07).</li>
          <li>Seguridad: HTTPS y 2FA recomendada para administradores (NFR-04).</li>
        </ul>
      </div>
    </div>
  );
};

