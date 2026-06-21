import { Fragment, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { hoursService } from "@/lib/services/hoursService";
import { reservationService } from "@/lib/services/reservationService";
import { tableService } from "@/lib/services/tableServices";
import type { OperatingHours, Reservation, ReservationStatus, Table as RestaurantTable } from "@/lib/types";

const statusColors: Record<ReservationStatus, string> = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmada: "bg-blue-100 text-blue-800",
  CheckedIn: "bg-orange-100 text-orange-800",
  Cancelada: "bg-red-100 text-red-800",
  Completada: "bg-green-100 text-green-800",
  NoShow: "bg-gray-100 text-gray-700",
};

const statusOptions: ReservationStatus[] = [
  "Pendiente",
  "Confirmada",
  "CheckedIn",
  "Cancelada",
  "Completada",
  "NoShow",
];

const terminalStatuses: ReservationStatus[] = ["Cancelada", "Completada", "NoShow"];
const activeReservationStatuses: ReservationStatus[] = ["Pendiente", "Confirmada", "CheckedIn"];
const RESERVATION_DURATION_MINUTES = 45;
const dayNames: OperatingHours["dayOfWeek"][] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const reservationDateTimeValue = (reservation: Reservation) =>
  new Date(`${reservation.reservationDate}T${reservation.reservationTime}`).getTime();

const sortReservationsByDateTime = (first: Reservation, second: Reservation) =>
  reservationDateTimeValue(first) - reservationDateTimeValue(second);

const reservationsOverlap = (first: Reservation, second: Reservation) => {
  if (first.reservationDate !== second.reservationDate) return false;
  const firstStart = timeToMinutes(first.reservationTime);
  const secondStart = timeToMinutes(second.reservationTime);
  return firstStart < secondStart + RESERVATION_DURATION_MINUTES &&
    secondStart < firstStart + RESERVATION_DURATION_MINUTES;
};

const getDateDayName = (date: string): OperatingHours["dayOfWeek"] => {
  const [year, month, day] = date.split("-").map(Number);
  return dayNames[new Date(year, month - 1, day).getDay()];
};

export const AdminReservationsPage = () => {
  const { restaurantId } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    reservationDate: today(),
    reservationTime: "19:00",
    partySize: 2,
    notes: "",
  });

  const tableById = useMemo(() => {
    const map = new Map<number, RestaurantTable>();
    for (const table of tables) map.set(table.id, table);
    return map;
  }, [tables]);

  const loadData = async () => {
    if (restaurantId === null) return;
    setIsRefreshing(true);
    try {
      const [reservationData, tableData] = await Promise.all([
        reservationService.getByRestaurant(restaurantId),
        tableService.getByRestaurantId(restaurantId),
      ]);
      setReservations(reservationData);
      setTables(tableData);
      const hoursData = await hoursService.getByRestaurantId(restaurantId);
      setOperatingHours(hoursData);
      setError(null);
    } catch (err) {
      console.error("Error loading reservations:", err);
      setError("No se pudieron cargar las reservas.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (restaurantId !== null) {
      void loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
      const q = search.trim().toLowerCase();
      const assignedTable = reservation.tableId ? tableById.get(reservation.tableId) : null;
      const matchesSearch =
        q.length === 0 ||
        String(reservation.id).includes(q) ||
        reservation.customerName.toLowerCase().includes(q) ||
        reservation.restaurantName.toLowerCase().includes(q) ||
        String(reservation.orderId ?? "").includes(q) ||
        String(assignedTable?.tableNumber ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [reservations, search, statusFilter, tableById]);

  const groupedReservations = useMemo(() => {
    const currentDate = today();
    const todayReservations: Reservation[] = [];
    const otherDaysReservations: Reservation[] = [];
    const closedReservations: Reservation[] = [];

    for (const reservation of filtered) {
      if (terminalStatuses.includes(reservation.status)) {
        closedReservations.push(reservation);
      } else if (reservation.reservationDate === currentDate) {
        todayReservations.push(reservation);
      } else {
        otherDaysReservations.push(reservation);
      }
    }

    return [
      {
        key: "today",
        title: "Reservas de hoy",
        description: "La hora más próxima aparece primero.",
        reservations: todayReservations.sort(sortReservationsByDateTime),
      },
      {
        key: "other-days",
        title: "Otros días",
        description: "Reservas activas fuera de la fecha actual.",
        reservations: otherDaysReservations.sort(sortReservationsByDateTime),
      },
      {
        key: "closed",
        title: "Canceladas y cerradas",
        description: "Reservas bloqueadas para edición.",
        reservations: closedReservations.sort(sortReservationsByDateTime),
      },
    ].filter((group) => group.reservations.length > 0);
  }, [filtered]);

  const getAssignableTables = (reservation: Reservation) => {
    return tables.filter((table) => {
      if (table.id === reservation.tableId) return true;
      return table.status !== "OCCUPIED" && table.status !== "CLEANING" && table.seats >= reservation.partySize;
    });
  };

  const tableHasScheduleConflict = (reservation: Reservation, tableId: number) => {
    return reservations.some((other) =>
      other.id !== reservation.id &&
      other.tableId === tableId &&
      activeReservationStatuses.includes(other.status) &&
      reservationsOverlap(reservation, other)
    );
  };

  const selectedDayHours = operatingHours.find(
    (hours) => hours.dayOfWeek === getDateDayName(formData.reservationDate)
  );

  const isFormTimeInsideSchedule = () => {
    if (!selectedDayHours) return false;
    const start = timeToMinutes(formData.reservationTime);
    const end = start + RESERVATION_DURATION_MINUTES;
    return start >= timeToMinutes(selectedDayHours.openTime) && end <= timeToMinutes(selectedDayHours.closeTime);
  };

  const scheduleError = !selectedDayHours
    ? "El restaurante no tiene horario para ese día."
    : !isFormTimeInsideSchedule()
      ? `La reserva debe terminar antes de ${selectedDayHours.closeTime.slice(0, 5)}.`
      : null;

  const handleAssignTable = async (reservation: Reservation, value: string) => {
    const tableId = Number(value);
    if (!Number.isFinite(tableId)) return;
    setIsSubmitting(true);
    try {
      await reservationService.assignTable(reservation.id, tableId);
      await loadData();
    } catch (err) {
      console.error("Error assigning table:", err);
      window.alert("No se pudo asignar la mesa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (reservation: Reservation, value: string) => {
    setIsSubmitting(true);
    try {
      await reservationService.updateStatus(reservation.id, value as ReservationStatus);
      await loadData();
    } catch (err) {
      console.error("Error updating reservation status:", err);
      window.alert("No se pudo actualizar el estado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (restaurantId === null) return;
    const customerId = Number(formData.customerId);
    if (!Number.isFinite(customerId) || customerId <= 0 || !formData.customerName.trim()) return;
    if (scheduleError) {
      window.alert(scheduleError);
      return;
    }
    setIsSubmitting(true);
    try {
      await reservationService.create({
        customerId,
        customerName: formData.customerName.trim(),
        restaurantId,
        restaurantName: `Restaurante ${restaurantId}`,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        partySize: formData.partySize,
        notes: formData.notes.trim() || undefined,
      });
      setIsCreateOpen(false);
      setFormData({
        customerId: "",
        customerName: "",
        reservationDate: today(),
        reservationTime: "19:00",
        partySize: 2,
        notes: "",
      });
      await loadData();
    } catch (err) {
      console.error("Error creating reservation:", err);
      window.alert("No se pudo crear la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (restaurantId === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <CalendarDays className="mb-3 h-10 w-10" />
        <p>No se encontró un restaurante asociado.</p>
      </div>
    );
  }

  const renderReservationRow = (reservation: Reservation) => {
    const assignedTable = reservation.tableId ? tableById.get(reservation.tableId) : null;
    const assignableTables = getAssignableTables(reservation);
    const isLocked = terminalStatuses.includes(reservation.status);

    return (
      <TableRow key={reservation.id} className={isLocked ? "bg-gray-50 text-gray-500" : undefined}>
        <TableCell className="font-medium">#{reservation.id}</TableCell>
        <TableCell>{reservation.customerName}</TableCell>
        <TableCell>
          <span className="inline-flex items-center gap-1 text-gray-600">
            <Users className="h-3.5 w-3.5" /> {reservation.partySize}
          </span>
        </TableCell>
        <TableCell>{reservation.reservationDate}</TableCell>
        <TableCell>{reservation.reservationTime}</TableCell>
        <TableCell>
          <Select
            value={reservation.tableId ? String(reservation.tableId) : ""}
            onChange={(event) => handleAssignTable(reservation, event.target.value)}
            disabled={isLocked || isSubmitting}
            className="min-w-36"
          >
            <option value="">Sin mesa</option>
            {assignableTables.map((table) => (
              <option
                key={table.id}
                value={table.id}
                disabled={table.id !== reservation.tableId && tableHasScheduleConflict(reservation, table.id)}
              >
                Mesa {table.tableNumber} · {table.seats} sillas
                {table.id === assignedTable?.id ? " · asignada" : ""}
                {table.id !== reservation.tableId && tableHasScheduleConflict(reservation, table.id) ? " · ocupada en ese horario" : ""}
              </option>
            ))}
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={reservation.status}
            onChange={(event) => handleStatusChange(reservation, event.target.value)}
            disabled={isLocked || isSubmitting}
            className={`min-w-36 ${statusColors[reservation.status]}`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </TableCell>
        <TableCell>{reservation.orderId ? `#${reservation.orderId}` : "-"}</TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-600">Asigna mesas manualmente y mantén el mapa sincronizado.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Nueva reserva
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, mesa, orden o ID..."
            className="md:max-w-md"
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ReservationStatus | "all")}
            className="md:w-56"
          >
            <option value="all">Todos los estados</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Orden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-gray-500">
                    Cargando reservas...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-gray-400">
                    No hay reservas para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                groupedReservations.map((group) => (
                  <Fragment key={group.key}>
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={8} className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-900">{group.title}</span>
                          <span className="text-xs text-gray-500">
                            {group.description} {group.reservations.length} reserva{group.reservations.length === 1 ? "" : "s"}.
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {group.reservations.map(renderReservationRow)}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Nueva reserva</DialogTitle>
            <DialogDescription>
              Crea la reserva y asígnale mesa desde la lista.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">ID cliente</Label>
              <Input
                id="customerId"
                type="number"
                min={1}
                value={formData.customerId}
                onChange={(event) => setFormData({ ...formData, customerId: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Cliente</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(event) => setFormData({ ...formData, customerName: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservationDate">Fecha</Label>
              <Input
                id="reservationDate"
                type="date"
                min={today()}
                value={formData.reservationDate}
                onChange={(event) => setFormData({ ...formData, reservationDate: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservationTime">Hora</Label>
              <Input
                id="reservationTime"
                type="time"
                min={selectedDayHours?.openTime.slice(0, 5)}
                max={selectedDayHours?.closeTime.slice(0, 5)}
                value={formData.reservationTime}
                onChange={(event) => setFormData({ ...formData, reservationTime: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partySize">Personas</Label>
              <Input
                id="partySize"
                type="number"
                min={1}
                value={formData.partySize}
                onChange={(event) => setFormData({ ...formData, partySize: Number(event.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
              />
            </div>
          </div>
          {scheduleError && <p className="text-sm text-red-600">{scheduleError}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting || !formData.customerId || !formData.customerName.trim() || Boolean(scheduleError)}
            >
              Crear reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
