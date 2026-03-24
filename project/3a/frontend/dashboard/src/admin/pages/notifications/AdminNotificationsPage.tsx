import { Bell, CheckCircle2, Clock4, XCircle } from "lucide-react";

type Channel = "Push" | "Email" | "SMS";

const notifications = [
  {
    id: "NT-1001",
    title: "Recordatorio de reserva",
    description: "Enviada 30 minutos antes (FR-07.1).",
    channel: "Push" as Channel,
    status: "Enviada",
    time: "Hoy 11:30",
  },
  {
    id: "NT-1002",
    title: "Nueva reserva recibida",
    description: "Restaurante notificado (FR-07.2).",
    channel: "Email" as Channel,
    status: "Enviada",
    time: "Hoy 11:32",
  },
  {
    id: "NT-1003",
    title: "Orden lista para servir",
    description: "Mesero notificado (FR-07.3 / US-22).",
    channel: "Push" as Channel,
    status: "Pendiente",
    time: "Hoy 11:40",
  },
  {
    id: "NT-1004",
    title: "Restablecer contraseña",
    description: "Link enviado al usuario (US-04).",
    channel: "Email" as Channel,
    status: "Fallida",
    time: "Hoy 10:05",
  },
];

const channelColors: Record<Channel, string> = {
  Push: "bg-blue-100 text-blue-700",
  Email: "bg-emerald-100 text-emerald-700",
  SMS: "bg-purple-100 text-purple-700",
};

const statusIcon = (status: string) => {
  if (status === "Enviada") return <CheckCircle2 size={16} className="text-green-600" />;
  if (status === "Pendiente") return <Clock4 size={16} className="text-amber-600" />;
  return <XCircle size={16} className="text-red-600" />;
};

export const AdminNotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-gray-600">
          Revisión de notificaciones clave: reservas, órdenes listas y recuperación de cuenta.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Bell size={16} />
          <span>Canales soportados: Push / Email / SMS.</span>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n.id} className="py-3 flex items-start gap-3">
              <div className="mt-0.5">{statusIcon(n.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{n.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${channelColors[n.channel]}`}>
                    {n.channel}
                  </span>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </div>
                <p className="text-sm text-gray-600">{n.description}</p>
                <p className="text-xs text-gray-500">{n.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

