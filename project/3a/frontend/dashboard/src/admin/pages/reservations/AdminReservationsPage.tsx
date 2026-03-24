import { useMemo, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ReservationStatus = "Pendiente" | "Confirmada" | "Cancelada" | "Completada";

interface AdminReservation {
  id: string;
  customer: string;
  restaurant: string;
  people: number;
  date: string;
  time: string;
  status: ReservationStatus;
  orderId?: string;
}

const statusColors: Record<ReservationStatus, string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmada: "bg-blue-100 text-blue-800",
  Cancelada: "bg-red-100 text-red-800",
  Completada: "bg-green-100 text-green-800",
};

const reservationsSeed: AdminReservation[] = [
  {
    id: "RSV-1201",
    customer: "Ana Ríos",
    restaurant: "Urban Bistro",
    people: 2,
    date: "2025-10-22",
    time: "19:30",
    status: "Confirmada",
    orderId: "ORD-9001",
  },
  {
    id: "RSV-1202",
    customer: "Carlos Mendez",
    restaurant: "Café Andino",
    people: 4,
    date: "2025-10-22",
    time: "20:00",
    status: "Pendiente",
  },
  {
    id: "RSV-1203",
    customer: "John Doe",
    restaurant: "Urban Bistro",
    people: 3,
    date: "2025-10-21",
    time: "21:00",
    status: "Completada",
    orderId: "ORD-9003",
  },
  {
    id: "RSV-1204",
    customer: "Emily Park",
    restaurant: "Café Andino",
    people: 5,
    date: "2025-10-21",
    time: "19:00",
    status: "Cancelada",
  },
];

export const AdminReservationsPage = () => {
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return reservationsSeed.filter((res) => {
      const matchesStatus = statusFilter === "all" || res.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        res.id.toLowerCase().includes(q) ||
        res.customer.toLowerCase().includes(q) ||
        res.restaurant.toLowerCase().includes(q) ||
        (res.orderId && res.orderId.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <p className="text-gray-600">
          Seguimiento de reservas con confirmación automática y vínculo a la orden (FR-04, FR-05).
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, cliente, restaurante u orden..."
            className="w-full md:w-1/2 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "all")}
              className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              {["Pendiente", "Confirmada", "Cancelada", "Completada"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table>
          <TableCaption>Reserva + orden enlazada para pre-order y recordatorios.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Orden</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.id}</TableCell>
                <TableCell>{res.customer}</TableCell>
                <TableCell>{res.restaurant}</TableCell>
                <TableCell>{res.people}</TableCell>
                <TableCell>{res.date}</TableCell>
                <TableCell>{res.time}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[res.status]}`}>
                    {res.status}
                  </span>
                </TableCell>
                <TableCell>{res.orderId ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

