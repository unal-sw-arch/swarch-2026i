import { Download, FileText } from "lucide-react";

const reports = [
  {
    id: "REP-001",
    title: "Reservas confirmadas (semana)",
    description: "Resumen de reservas creadas, confirmadas y canceladas.",
    period: "Últimos 7 días",
    size: "240 KB",
  },
  {
    id: "REP-002",
    title: "Órdenes por estado",
    description: "Estados Preparing / Ready / Served / Delivered / Cancelled.",
    period: "Últimas 24 horas",
    size: "310 KB",
  },
  {
    id: "REP-003",
    title: "Ratings y comentarios",
    description: "Promedios y feedback posterior a la visita (FR-06).",
    period: "Último mes",
    size: "180 KB",
  },
  {
    id: "REP-004",
    title: "Aprobaciones de restaurantes",
    description: "Solicitudes pendientes y aprobadas por el administrador (FR-01.5).",
    period: "Últimos 30 días",
    size: "220 KB",
  },
];

export const AdminReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600">
          Exporta información de reservas, órdenes, calificaciones y aprobaciones administrativas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">{report.period}</p>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{report.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{report.size}</span>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                <Download size={16} />
                Exportar CSV/PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

