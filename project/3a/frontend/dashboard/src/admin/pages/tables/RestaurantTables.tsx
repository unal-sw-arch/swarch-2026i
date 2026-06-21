import { useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  CalendarClock,
  Check,
  ChefHat,
  Clock,
  Eraser,
  Grid3X3,
  Move,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCw,
  Square,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { kitchenOrderService } from "@/lib/services/kitchenOrderService";
import { reservationService } from "@/lib/services/reservationService";
import { restaurantService } from "@/lib/services/restaurantService";
import { tableService } from "@/lib/services/tableServices";
import type { KitchenOrder, KitchenOrderStatus, Reservation, ReservationStatus, Table as TableType } from "@/lib/types";

const DEFAULT_GRID_COLS = 16;
const DEFAULT_GRID_ROWS = 12;
const MIN_GRID_SIZE = 4;
const MAX_GRID_SIZE = 32;

type TableStatus = TableType["status"];
type CellType = "SEAT" | "TABLE";
type Tool = "select" | "seat" | "table" | "erase" | "move";
type CreateMode = "paint" | "preset";

interface LayoutCell {
  x: number;
  y: number;
  type: CellType;
}

interface DraftTable {
  editingTableId?: number;
  tableNumber: string;
  status: TableStatus;
  cells: LayoutCell[];
}

const statusColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  OCCUPIED: "bg-orange-100 text-orange-800 border-orange-200",
  RESERVED: "bg-blue-100 text-blue-800 border-blue-200",
  CLEANING: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusCellColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-900 border-green-300",
  OCCUPIED: "bg-orange-100 text-orange-900 border-orange-300",
  RESERVED: "bg-blue-100 text-blue-900 border-blue-300",
  CLEANING: "bg-gray-200 text-gray-800 border-gray-300",
};

const statusLabels: Record<TableStatus, string> = {
  AVAILABLE: "Libre",
  OCCUPIED: "En uso",
  RESERVED: "Reservada",
  CLEANING: "Limpieza",
};

const kitchenStatusLabels: Record<KitchenOrderStatus, string> = {
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparación",
  READY: "Lista",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

const ACTIVE_KITCHEN_STATUSES: KitchenOrderStatus[] = ["PENDING", "IN_PREPARATION", "READY"];
const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = ["Pendiente", "Confirmada", "CheckedIn"];
const RESERVATION_DURATION_MINUTES = 45;
const CURRENT_RESERVATION_WINDOW_MINUTES = 60;

function cellKey(x: number, y: number) {
  return `${x}:${y}`;
}

function parseCells(table: TableType): LayoutCell[] {
  if (table.layoutShape) {
    try {
      const parsed = JSON.parse(table.layoutShape) as LayoutCell[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (cell) =>
            Number.isInteger(cell.x) &&
            Number.isInteger(cell.y) &&
            (cell.type === "SEAT" || cell.type === "TABLE")
        );
      }
    } catch {
      // Fall back to the rectangular defaults below.
    }
  }

  return Array.from({ length: table.seats }, (_, index) => ({
    x: table.layoutX + index,
    y: table.layoutY,
    type: "SEAT" as const,
  }));
}

function getBounds(cells: LayoutCell[]) {
  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function sortCells(cells: LayoutCell[]) {
  return [...cells].sort((a, b) => a.y - b.y || a.x - b.x || a.type.localeCompare(b.type));
}

function compactShape(cells: LayoutCell[]) {
  return JSON.stringify(sortCells(cells));
}

function countSeats(cells: LayoutCell[]) {
  return cells.filter((cell) => cell.type === "SEAT").length;
}

function countTableBlocks(cells: LayoutCell[]) {
  return cells.filter((cell) => cell.type === "TABLE").length;
}

function hasValidTableBlockCount(seats: number, tableBlocks: number) {
  return tableBlocks >= seats || (seats % 2 === 1 && tableBlocks === seats - 1);
}

function hasSeatTouchingEveryTableBlock(cells: LayoutCell[]) {
  const seats = new Set(cells.filter((cell) => cell.type === "SEAT").map((cell) => cellKey(cell.x, cell.y)));
  const tableBlocks = cells.filter((cell) => cell.type === "TABLE");

  return tableBlocks.every((cell) =>
    [
      cellKey(cell.x + 1, cell.y),
      cellKey(cell.x - 1, cell.y),
      cellKey(cell.x, cell.y + 1),
      cellKey(cell.x, cell.y - 1),
    ].some((key) => seats.has(key))
  );
}

function hasTableTouchingEverySeat(cells: LayoutCell[]) {
  const tableBlocks = new Set(cells.filter((cell) => cell.type === "TABLE").map((cell) => cellKey(cell.x, cell.y)));
  const seats = cells.filter((cell) => cell.type === "SEAT");

  return seats.every((cell) =>
    [
      cellKey(cell.x + 1, cell.y),
      cellKey(cell.x - 1, cell.y),
      cellKey(cell.x, cell.y + 1),
      cellKey(cell.x, cell.y - 1),
    ].some((key) => tableBlocks.has(key))
  );
}

function hasValidSeatDistributionAroundTables(cells: LayoutCell[], seats: number) {
  const seatKeys = new Set(cells.filter((cell) => cell.type === "SEAT").map((cell) => cellKey(cell.x, cell.y)));
  const tableBlocks = cells.filter((cell) => cell.type === "TABLE");

  return tableBlocks.every((cell) => {
    const touchingDirections = [
      { name: "right", key: cellKey(cell.x + 1, cell.y) },
      { name: "left", key: cellKey(cell.x - 1, cell.y) },
      { name: "down", key: cellKey(cell.x, cell.y + 1) },
      { name: "up", key: cellKey(cell.x, cell.y - 1) },
    ]
      .filter((direction) => seatKeys.has(direction.key))
      .map((direction) => direction.name);

    if (touchingDirections.length <= 1) return true;
    if (touchingDirections.length > 2 || seats % 2 === 0) return false;

    const [first, second] = touchingDirections;
    return !(
      (first === "left" && second === "right") ||
      (first === "right" && second === "left") ||
      (first === "up" && second === "down") ||
      (first === "down" && second === "up")
    );
  });
}

function isInsideGrid(cells: LayoutCell[], cols: number, rows: number) {
  return cells.every((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < cols && cell.y < rows);
}

function clampGridSize(value: number) {
  if (!Number.isFinite(value)) return MIN_GRID_SIZE;
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, Math.floor(value)));
}

function tableNumberKey(value: string | number) {
  const normalized = String(value).trim().toLowerCase();
  const numeric = Number(normalized);
  return Number.isFinite(numeric) && normalized !== "" ? String(numeric) : normalized;
}

function tableOrderKey(table: TableType) {
  return `id:${table.id}`;
}

function kitchenOrderKeys(order: KitchenOrder) {
  const keys = new Set<string>();
  if (order.tableId !== null && order.tableId !== undefined) {
    keys.add(`id:${order.tableId}`);
  }
  keys.add(`number:${tableNumberKey(order.tableNumber)}`);
  return keys;
}

function shortTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function reservationDateTime(reservation: Reservation) {
  return new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
}

function isCurrentReservation(reservation: Reservation, now: Date) {
  const start = reservationDateTime(reservation);
  const end = new Date(start.getTime() + RESERVATION_DURATION_MINUTES * 60_000);
  const currentWindowEnd = new Date(now.getTime() + CURRENT_RESERVATION_WINDOW_MINUTES * 60_000);
  return end > now && start <= currentWindowEnd;
}

function isFutureReservation(reservation: Reservation, now: Date) {
  const start = reservationDateTime(reservation);
  const currentWindowEnd = new Date(now.getTime() + CURRENT_RESERVATION_WINDOW_MINUTES * 60_000);
  return start > currentWindowEnd;
}

function buildPresetCells(seats: number, originX = 0, originY = 0): LayoutCell[] {
  if (seats === 2) {
    const x = originX;
    return [
      { x, y: originY, type: "SEAT" as const },
      { x, y: originY + 1, type: "TABLE" as const },
      { x, y: originY + 2, type: "TABLE" as const },
      { x, y: originY + 3, type: "SEAT" as const },
    ];
  }

  const tableBlocks = seats > 1 && seats % 2 === 1 ? seats - 1 : seats;
  const width = tableBlocks === 1 ? 1 : tableBlocks === 4 ? 2 : Math.ceil(tableBlocks / 2);
  const height = tableBlocks === 1 || tableBlocks === 2 ? 1 : 2;
  const tableCells: LayoutCell[] = Array.from({ length: tableBlocks }, (_, index) => ({
    x: originX + 1 + (index % width),
    y: originY + 1 + Math.floor(index / width),
    type: "TABLE" as const,
  }));
  const seatsByKey = new Map<string, LayoutCell>();

  for (const cell of tableCells) {
    const seatY = height === 1 || cell.y === originY + 1 ? cell.y - 1 : cell.y + 1;
    const seat = { x: cell.x, y: seatY, type: "SEAT" as const };
    seatsByKey.set(cellKey(seat.x, seat.y), seat);
  }

  const extraSeats: LayoutCell[] = [
    ...tableCells.map((cell) => ({ x: cell.x - 1, y: cell.y, type: "SEAT" as const })),
    ...tableCells.map((cell) => ({ x: cell.x + width, y: cell.y, type: "SEAT" as const })),
    ...tableCells.map((cell) => ({ x: cell.x, y: cell.y + height, type: "SEAT" as const })),
  ];

  for (const seat of extraSeats) {
    if (seatsByKey.size >= seats) break;
    seatsByKey.set(cellKey(seat.x, seat.y), seat);
  }

  return [...tableCells, ...Array.from(seatsByKey.values()).slice(0, seats)];
}

function rotateCellsClockwise(cells: LayoutCell[]) {
  if (cells.length === 0) return cells;
  const bounds = getBounds(cells);
  return cells.map((cell) => {
    const relX = cell.x - bounds.x;
    const relY = cell.y - bounds.y;
    return {
      ...cell,
      x: bounds.x + bounds.height - 1 - relY,
      y: bounds.y + relX,
    };
  });
}

export const TablesPage = () => {
  const { restaurantId } = useAuth();

  const [tables, setTables] = useState<TableType[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kitchenError, setKitchenError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [isPainting, setIsPainting] = useState(false);
  const [draft, setDraft] = useState<DraftTable | null>(null);
  const [gridCols, setGridCols] = useState(DEFAULT_GRID_COLS);
  const [gridRows, setGridRows] = useState(DEFAULT_GRID_ROWS);
  const layoutLoadedRef = useRef(false);
  const [formData, setFormData] = useState({
    tableNumber: "",
    status: "AVAILABLE" as TableStatus,
    mode: "paint" as CreateMode,
    seats: 4,
  });

  const selectedTable = tables.find((table) => table.id === selectedId) ?? null;

  const futureReservationOrderIds = useMemo(() => {
    const ids = new Set<number>();
    for (const reservation of reservations) {
      if (
        reservation.orderId &&
        ACTIVE_RESERVATION_STATUSES.includes(reservation.status) &&
        isFutureReservation(reservation, now)
      ) {
        ids.add(reservation.orderId);
      }
    }
    return ids;
  }, [now, reservations]);

  const activeOrdersByTable = useMemo(() => {
    const map = new Map<string, KitchenOrder[]>();
    for (const order of kitchenOrders) {
      if (!ACTIVE_KITCHEN_STATUSES.includes(order.status)) continue;
      if (futureReservationOrderIds.has(order.id)) continue;
      for (const key of kitchenOrderKeys(order)) {
        map.set(key, [...(map.get(key) ?? []), order]);
      }
    }
    return map;
  }, [futureReservationOrderIds, kitchenOrders]);

  const reservationsByTable = useMemo(() => {
    const map = new Map<number, { current: Reservation[]; future: Reservation[] }>();

    for (const reservation of reservations) {
      if (!reservation.tableId || !ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) continue;
      const entry = map.get(reservation.tableId) ?? { current: [], future: [] };
      if (isCurrentReservation(reservation, now)) {
        entry.current.push(reservation);
      } else if (isFutureReservation(reservation, now)) {
        entry.future.push(reservation);
      }
      map.set(reservation.tableId, entry);
    }

    return map;
  }, [now, reservations]);

  const getTableReservations = (table: TableType) => {
    return reservationsByTable.get(table.id) ?? { current: [], future: [] };
  };

  const getActiveOrders = (table: TableType) => {
    const byId = activeOrdersByTable.get(tableOrderKey(table));
    if (byId) return byId;
    return activeOrdersByTable.get(`number:${tableNumberKey(table.tableNumber)}`) ?? [];
  };

  const tableCellsById = useMemo(() => {
    const map = new Map<number, LayoutCell[]>();
    for (const table of tables) {
      map.set(table.id, parseCells(table));
    }
    return map;
  }, [tables]);

  const occupiedCells = useMemo(() => {
    const map = new Map<string, { table: TableType; cell: LayoutCell }>();
    for (const table of tables) {
      const cells = tableCellsById.get(table.id) ?? [];
      for (const cell of cells) {
        map.set(cellKey(cell.x, cell.y), { table, cell });
      }
    }
    return map;
  }, [tables, tableCellsById]);

  const loadTables = async () => {
    if (restaurantId === null) return;

    setIsRefreshing(true);
    layoutLoadedRef.current = false;
    try {
      const [tableData, , orderResult, reservationResult] = await Promise.all([
        tableService.getByRestaurantId(restaurantId),
        restaurantService
          .getById(restaurantId)
          .then((restaurant) => {
            setGridCols(clampGridSize(Number(restaurant.layoutCols ?? DEFAULT_GRID_COLS)));
            setGridRows(clampGridSize(Number(restaurant.layoutRows ?? DEFAULT_GRID_ROWS)));
            layoutLoadedRef.current = true;
          })
          .catch((error) => {
            console.error("Error al cargar layout del restaurante:", error);
            layoutLoadedRef.current = true;
          }),
        kitchenOrderService
          .getKitchenOrders(restaurantId)
          .then((orders) => ({ orders, error: null }))
          .catch((error) => ({ orders: [] as KitchenOrder[], error })),
        reservationService
          .getByRestaurant(restaurantId)
          .then((reservationData) => ({ reservations: reservationData, error: null }))
          .catch((error) => ({ reservations: [] as Reservation[], error })),
      ]);
      setTables(tableData);
      setKitchenOrders(orderResult.orders);
      setReservations(reservationResult.reservations);
      setKitchenError(orderResult.error ? "No se pudieron cargar las órdenes activas de cocina." : null);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (restaurantId !== null) {
      loadTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restaurantId === null || !layoutLoadedRef.current) return;
    const timeout = window.setTimeout(() => {
      void restaurantService.updateLayout(restaurantId, {
        layoutCols: gridCols,
        layoutRows: gridRows,
      }).catch((error) => {
        console.error("Error al guardar layout del restaurante:", error);
      });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [gridCols, gridRows, restaurantId]);

  const canPlaceCells = (cells: LayoutCell[], ignoreTableId?: number) => {
    if (!isInsideGrid(cells, gridCols, gridRows)) return false;

    return cells.every((cell) => {
      const occupied = occupiedCells.get(cellKey(cell.x, cell.y));
      return !occupied || occupied.table.id === ignoreTableId;
    });
  };

  const findPresetCells = (seats: number) => {
    for (let y = 0; y < gridRows; y += 1) {
      for (let x = 0; x < gridCols; x += 1) {
        const cells = buildPresetCells(seats, x, y);
        if (canPlaceCells(cells)) return cells;
      }
    }
    return null;
  };

  const startDraft = () => {
    if (!formData.tableNumber.trim()) return;
    const seats = Math.min(32, Math.max(1, Math.floor(formData.seats)));
    const presetCells = formData.mode === "preset" ? findPresetCells(seats) : [];
    if (formData.mode === "preset" && !presetCells) {
      window.alert("No hay espacio libre suficiente para generar esa mesa.");
      return;
    }
    setDraft({
      tableNumber: formData.tableNumber.trim(),
      status: formData.status,
      cells: presetCells ?? [],
    });
    setSelectedId(null);
    setTool(formData.mode === "preset" ? "select" : "seat");
    setIsCreateOpen(false);
  };

  const startEditDraft = (table: TableType) => {
    setDraft({
      editingTableId: table.id,
      tableNumber: table.tableNumber,
      status: table.status,
      cells: parseCells(table),
    });
    setSelectedId(table.id);
    setTool("seat");
  };

  const paintDraftCell = (x: number, y: number) => {
    if (!draft) return;
    const occupied = occupiedCells.get(cellKey(x, y));
    if (occupied && occupied.table.id !== draft.editingTableId) return;

    setDraft((current) => {
      if (!current) return current;
      const withoutCell = current.cells.filter((cell) => cell.x !== x || cell.y !== y);
      if (tool === "erase") {
        return { ...current, cells: withoutCell };
      }
      if (tool === "seat" || tool === "table") {
        return { ...current, cells: [...withoutCell, { x, y, type: tool === "seat" ? "SEAT" : "TABLE" }] };
      }
      return current;
    });
  };

  const handleCellMouseDown = (x: number, y: number) => {
    const occupied = occupiedCells.get(cellKey(x, y));

    if (draft && (tool === "seat" || tool === "table" || tool === "erase")) {
      setIsPainting(true);
      paintDraftCell(x, y);
      return;
    }

    if (occupied && !draft) {
      setSelectedId(occupied.table.id);
      return;
    }

    if (selectedTable && tool === "move" && !occupied) {
      moveSelectedTo(x, y);
    }
  };

  const handleCellEnter = (x: number, y: number) => {
    if (isPainting && draft) {
      paintDraftCell(x, y);
    }
  };

  const handleSaveDraft = async () => {
    if (restaurantId === null || !draft) return;
    const tableNumber = draft.tableNumber.trim();
    const seats = countSeats(draft.cells);
    const tableBlocks = countTableBlocks(draft.cells);

    if (!tableNumber) {
      window.alert("Escribe un identificador para la mesa.");
      return;
    }
    if (seats < 1) {
      window.alert("Pinta al menos una silla.");
      return;
    }
    if (tableBlocks < 1) {
      window.alert("Pinta al menos un recuadro de mesa.");
      return;
    }
    if (!hasValidTableBlockCount(seats, tableBlocks)) {
      window.alert("Usa al menos un recuadro de mesa por silla; si los asientos son impares puedes usar un recuadro menos.");
      return;
    }
    if (!hasSeatTouchingEveryTableBlock(draft.cells)) {
      window.alert("Cada recuadro de mesa debe estar en contacto directo con una silla.");
      return;
    }
    if (!hasTableTouchingEverySeat(draft.cells)) {
      window.alert("Cada silla debe estar en contacto directo con un recuadro de mesa.");
      return;
    }
    if (!hasValidSeatDistributionAroundTables(draft.cells, seats)) {
      window.alert("Una mesa solo puede tener dos sillas si están en lados continuos, no opuestos.");
      return;
    }
    if (!canPlaceCells(draft.cells, draft.editingTableId)) {
      window.alert("La forma se sale de la grilla o cruza otra mesa.");
      return;
    }

    const bounds = getBounds(draft.cells);
    setIsSubmitting(true);
    try {
      const payload = {
        tableNumber,
        seats,
        status: draft.status,
        layoutX: bounds.x,
        layoutY: bounds.y,
        layoutWidth: bounds.width,
        layoutHeight: bounds.height,
        layoutShape: compactShape(draft.cells),
      };

      if (draft.editingTableId) {
        const updated = await tableService.update(draft.editingTableId, payload);
        if (!updated) return;
        setTables((prev) => prev.map((table) => (table.id === updated.id ? updated : table)));
        setSelectedId(updated.id);
      } else {
        const created = await tableService.create(restaurantId, payload);
        if (!created) return;

        const withStatus =
          draft.status === "AVAILABLE" ? created : await tableService.updateStatus(created.id, draft.status);
        setTables((prev) => [...prev, withStatus ?? created]);
        setSelectedId(created.id);
      }
      setDraft(null);
      setTool("select");
      setFormData({ tableNumber: "", status: "AVAILABLE", mode: "paint", seats: 4 });
    } catch (error) {
      console.error("Error al guardar mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta mesa?")) {
      const ok = await tableService.delete(id);
      if (ok) {
        setTables((prev) => prev.filter((table) => table.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    }
  };

  const handleStatusChange = async (table: TableType, status: TableStatus) => {
    const updated = await tableService.updateStatus(table.id, status);
    if (updated) {
      setTables((prev) => prev.map((item) => (item.id === table.id ? updated : item)));
    }
  };

  const moveSelectedTo = async (targetX: number, targetY: number) => {
    if (!selectedTable) return;
    const cells = tableCellsById.get(selectedTable.id) ?? [];
    if (cells.length === 0) return;

    const bounds = getBounds(cells);
    const dx = targetX - bounds.x;
    const dy = targetY - bounds.y;
    await moveSelectedBy(dx, dy);
  };

  const moveSelectedBy = async (dx: number, dy: number) => {
    if (!selectedTable || (dx === 0 && dy === 0)) return;
    const cells = tableCellsById.get(selectedTable.id) ?? [];
    const moved = cells.map((cell) => ({ ...cell, x: cell.x + dx, y: cell.y + dy }));

    if (!canPlaceCells(moved, selectedTable.id)) {
      return;
    }

    const bounds = getBounds(moved);
    const updated = await tableService.updateLayout(selectedTable.id, {
      layoutX: bounds.x,
      layoutY: bounds.y,
      layoutWidth: bounds.width,
      layoutHeight: bounds.height,
      layoutShape: compactShape(moved),
    });

    if (updated) {
      setTables((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const rotateDraft = () => {
    if (!draft) return;
    const rotated = rotateCellsClockwise(draft.cells);
    if (!canPlaceCells(rotated, draft.editingTableId)) {
      window.alert("La mesa rotada se sale de la grilla o cruza otra mesa.");
      return;
    }
    setDraft((current) => current ? { ...current, cells: rotated } : current);
  };

  const rotateSelected = async () => {
    if (!selectedTable) return;
    const cells = tableCellsById.get(selectedTable.id) ?? [];
    const rotated = rotateCellsClockwise(cells);
    if (!canPlaceCells(rotated, selectedTable.id)) {
      window.alert("La mesa rotada se sale de la grilla o cruza otra mesa.");
      return;
    }
    const bounds = getBounds(rotated);
    const updated = await tableService.updateLayout(selectedTable.id, {
      layoutX: bounds.x,
      layoutY: bounds.y,
      layoutWidth: bounds.width,
      layoutHeight: bounds.height,
      layoutShape: compactShape(rotated),
    });
    if (updated) {
      setTables((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const cancelDraft = () => {
    setDraft(null);
    setTool("select");
  };

  const getVisualStatus = (table: TableType): TableStatus => {
    if (getActiveOrders(table).length > 0) return "OCCUPIED";
    const tableReservations = getTableReservations(table);
    if (table.status === "RESERVED" && tableReservations.current.length === 0) {
      return "AVAILABLE";
    }
    return table.status;
  };

  const renderCell = (x: number, y: number) => {
    const key = cellKey(x, y);
    const draftCell = draft?.cells.find((cell) => cell.x === x && cell.y === y);
    const occupied = occupiedCells.get(key);
    const table = occupied?.table.id === draft?.editingTableId ? undefined : occupied?.table;
    const isSelected = table?.id === selectedId;
    const cells = table ? tableCellsById.get(table.id) ?? [] : [];
    const firstCell = cells.length > 0 && getBounds(cells).x === x && getBounds(cells).y === y;
    const activeOrders = table ? getActiveOrders(table) : [];
    const tableReservations = table ? getTableReservations(table) : { current: [], future: [] };
    const hasFutureReservations = tableReservations.future.length > 0;
    const visualStatus = table ? getVisualStatus(table) : undefined;
    const type = draftCell?.type ?? occupied?.cell.type;

    const baseClass =
      "relative aspect-square min-h-9 border border-gray-200 text-[10px] font-semibold transition-colors";
    const typeClass =
      draftCell
        ? draftCell.type === "SEAT"
          ? "bg-purple-100 text-purple-900 border-purple-300"
          : "bg-violet-200 text-violet-950 border-violet-300"
        : table && visualStatus
          ? statusCellColors[visualStatus]
          : "bg-white hover:bg-gray-50";
    const selectedClass = isSelected ? "ring-2 ring-blue-500 ring-inset" : "";
    const draftClass = draftCell ? "ring-2 ring-purple-500 ring-inset" : "";

    return (
      <button
        key={key}
        type="button"
        className={`${baseClass} ${typeClass} ${selectedClass} ${draftClass}`}
        onMouseDown={() => handleCellMouseDown(x, y)}
        onMouseEnter={() => handleCellEnter(x, y)}
        title={
          table
            ? `Mesa ${table.tableNumber} · ${statusLabels[visualStatus ?? table.status]}${
                activeOrders.length ? ` · ${activeOrders.length} orden(es) activas` : ""
              }${
                hasFutureReservations ? ` · ${tableReservations.future.length} reserva(s) más tarde` : ""
              }`
            : draftCell
              ? "Forma en borrador"
              : `Celda ${x}, ${y}`
        }
      >
        {type === "SEAT" && <Armchair className="mx-auto h-3.5 w-3.5" />}
        {type === "TABLE" && <Square className="mx-auto h-3.5 w-3.5" />}
        {firstCell && table && (
          <span className="absolute left-0.5 top-0.5 rounded bg-white/80 px-1 text-[9px] text-gray-800">
            {table.tableNumber}
          </span>
        )}
        {firstCell && activeOrders.length > 0 && (
          <span className="absolute right-0.5 bottom-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[9px] text-white">
            {activeOrders.length}
          </span>
        )}
        {firstCell && activeOrders.length === 0 && hasFutureReservations && (
          <span className="absolute right-0.5 bottom-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] text-white">
            <CalendarClock className="h-3 w-3" />
          </span>
        )}
      </button>
    );
  };

  const selectedActiveOrders = selectedTable ? getActiveOrders(selectedTable) : [];
  const selectedTableReservations = selectedTable ? getTableReservations(selectedTable) : { current: [], future: [] };
  const selectedVisualStatus = selectedTable ? getVisualStatus(selectedTable) : null;

  if (restaurantId === null && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <RefreshCw className="mb-2 animate-spin" />
        <p>Cargando configuración del restaurante...</p>
      </div>
    );
  }

  if (restaurantId === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="mb-4 text-red-500" size={48} />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-gray-600">No se encontró un restaurante asociado a tu cuenta de Manager.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1" onMouseUp={() => setIsPainting(false)} onMouseLeave={() => setIsPainting(false)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapa de Mesas</h1>
          <p className="text-sm text-gray-600">Pinta sillas y recuadros de mesa; al confirmar quedan agrupados.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadTables} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)} disabled={Boolean(draft)}>
            <Plus size={18} /> Nueva Mesa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <Button variant={tool === "select" ? "default" : "outline"} size="sm" onClick={() => setTool("select")}>
              <MousePointer2 /> Seleccionar
            </Button>
            <Button variant={tool === "seat" ? "default" : "outline"} size="sm" onClick={() => setTool("seat")} disabled={!draft}>
              <Armchair /> Silla
            </Button>
            <Button variant={tool === "table" ? "default" : "outline"} size="sm" onClick={() => setTool("table")} disabled={!draft}>
              <Square /> Mesa
            </Button>
            <Button variant={tool === "erase" ? "default" : "outline"} size="sm" onClick={() => setTool("erase")} disabled={!draft}>
              <Eraser /> Borrar
            </Button>
            <Button variant={tool === "move" ? "default" : "outline"} size="sm" onClick={() => setTool("move")} disabled={!selectedTable || Boolean(draft)}>
              <Move /> Mover
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={draft ? rotateDraft : rotateSelected}
              disabled={isSubmitting || (!draft && !selectedTable)}
            >
              <RotateCw /> Rotar
            </Button>
            {draft && (
              <>
                <Button size="sm" onClick={handleSaveDraft} disabled={isSubmitting}>
                  <Check /> Confirmar
                </Button>
                <Button variant="outline" size="sm" onClick={cancelDraft} disabled={isSubmitting}>
                  <X /> Cancelar
                </Button>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="gridCols" className="text-xs text-gray-500">Columnas</Label>
              <Input
                id="gridCols"
                type="number"
                min={MIN_GRID_SIZE}
                max={MAX_GRID_SIZE}
                value={gridCols}
                onChange={(event) => setGridCols(clampGridSize(Number(event.target.value)))}
                className="h-8 w-16"
                disabled={Boolean(draft)}
              />
              <Label htmlFor="gridRows" className="text-xs text-gray-500">Filas</Label>
              <Input
                id="gridRows"
                type="number"
                min={MIN_GRID_SIZE}
                max={MAX_GRID_SIZE}
                value={gridRows}
                onChange={(event) => setGridRows(clampGridSize(Number(event.target.value)))}
                className="h-8 w-16"
                disabled={Boolean(draft)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1"><Armchair className="h-3.5 w-3.5 text-emerald-600" /> Silla</span>
            <span className="inline-flex items-center gap-1"><Square className="h-3.5 w-3.5 text-amber-600" /> Recuadro de mesa</span>
            <span className="inline-flex items-center gap-1"><ChefHat className="h-3.5 w-3.5 text-orange-600" /> Órdenes activas</span>
            <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-blue-600" /> Reserva más tarde</span>
            <span className="inline-flex items-center gap-1"><Grid3X3 className="h-3.5 w-3.5 text-blue-600" /> {gridCols} x {gridRows}</span>
            {Object.entries(statusLabels).map(([status, label]) => (
              <span key={status} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusColors[status as TableStatus]}`}>
                {label}
              </span>
            ))}
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Cargando mesas...
              </div>
            ) : (
              <div
                className="grid min-w-[720px] select-none gap-1"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: gridRows }).flatMap((_, y) =>
                  Array.from({ length: gridCols }).map((__, x) => renderCell(x, y))
                )}
              </div>
            )}
          </div>

          {kitchenError && (
            <p className="text-xs text-amber-700">{kitchenError}</p>
          )}
        </section>

        <aside className="space-y-3">
          {draft && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h2 className="font-semibold text-purple-950">
                {draft.editingTableId ? "Editando mesa" : "Mesa en borrador"}
              </h2>
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="draftTableNumber">Identificador</Label>
                  <Input
                    id="draftTableNumber"
                    value={draft.tableNumber}
                    onChange={(event) => setDraft((current) => current ? { ...current, tableNumber: event.target.value } : current)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="draftStatus">Estado</Label>
                  <Select
                    id="draftStatus"
                    value={draft.status}
                    onChange={(event) => setDraft((current) => current ? { ...current, status: event.target.value as TableStatus } : current)}
                    className="bg-white"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <p className="mt-1 text-sm text-purple-800">
                {countSeats(draft.cells)} sillas · {countTableBlocks(draft.cells)} recuadros de mesa
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full bg-white" onClick={rotateDraft}>
                <RotateCw /> Rotar borrador
              </Button>
            </div>
          )}

          {selectedTable && !draft && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Mesa #{selectedTable.tableNumber}</h2>
                  <p className="text-sm text-gray-500">{selectedTable.seats} sillas</p>
                </div>
                {selectedVisualStatus && (
                  <Badge className={statusColors[selectedVisualStatus]}>{statusLabels[selectedVisualStatus]}</Badge>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label>Estado</Label>
                <Select
                  value={selectedTable.status}
                  onChange={(event) => handleStatusChange(selectedTable, event.target.value as TableStatus)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>

              {selectedActiveOrders.length > 0 && (
                <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-950">
                      <ChefHat className="h-4 w-4" /> Cocina activa
                    </span>
                    <Badge className="border-orange-200 bg-white text-orange-800">
                      {selectedActiveOrders.length} orden{selectedActiveOrders.length === 1 ? "" : "es"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {selectedActiveOrders.map((order) => (
                      <div key={order.id} className="rounded-md bg-white/80 px-2 py-1.5 text-xs text-orange-950">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">Orden #{order.id}</span>
                          <span>{kitchenStatusLabels[order.status]}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-orange-700">
                          <Clock className="h-3 w-3" /> {shortTime(order.createdAt)}
                          <span>·</span>
                          <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTable.status !== "OCCUPIED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full border-orange-200 bg-white text-orange-900 hover:bg-orange-100"
                      onClick={() => handleStatusChange(selectedTable, "OCCUPIED")}
                    >
                      Marcar mesa en uso
                    </Button>
                  )}
                </div>
              )}

              {selectedTableReservations.future.length > 0 && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-950">
                      <CalendarClock className="h-4 w-4" /> Reservas más tarde
                    </span>
                    <Badge className="border-blue-200 bg-white text-blue-800">
                      {selectedTableReservations.future.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {selectedTableReservations.future.slice(0, 3).map((reservation) => (
                      <div key={reservation.id} className="rounded-md bg-white/80 px-2 py-1.5 text-xs text-blue-950">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">Reserva #{reservation.id}</span>
                          <span>{reservation.reservationTime}</span>
                        </div>
                        <div className="mt-1 text-blue-700">
                          {reservation.customerName} · {reservation.partySize} persona{reservation.partySize === 1 ? "" : "s"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <span />
                <Button variant="outline" size="sm" onClick={() => moveSelectedBy(0, -1)}>Arriba</Button>
                <span />
                <Button variant="outline" size="sm" onClick={() => moveSelectedBy(-1, 0)}>Izq.</Button>
                <Button variant="outline" size="sm" onClick={() => moveSelectedBy(0, 1)}>Abajo</Button>
                <Button variant="outline" size="sm" onClick={() => moveSelectedBy(1, 0)}>Der.</Button>
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => startEditDraft(selectedTable)}
              >
                <Grid3X3 /> Editar forma
              </Button>

              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={rotateSelected}
              >
                <RotateCw /> Rotar mesa
              </Button>

              <Button
                variant="destructive"
                className="mt-4 w-full"
                onClick={() => handleDelete(selectedTable.id)}
              >
                <Trash2 /> Eliminar mesa
              </Button>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Mesas</h2>
            <div className="space-y-2">
              {tables.length === 0 ? (
                <p className="text-sm text-gray-400">No hay mesas registradas.</p>
              ) : (
                tables.map((table) => {
                  const activeOrders = getActiveOrders(table);
                  const tableReservations = getTableReservations(table);

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(table.id);
                        setTool("select");
                      }}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                        selectedId === table.id ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">#{table.tableNumber}</span>
                      <span className="inline-flex items-center gap-2 text-gray-500">
                        {activeOrders.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800">
                            <ChefHat className="h-3 w-3" /> {activeOrders.length}
                          </span>
                        )}
                        {activeOrders.length === 0 && tableReservations.future.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                            <CalendarClock className="h-3 w-3" /> {tableReservations.future.length}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {table.seats}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Iniciar Mesa</DialogTitle>
            <DialogDescription>
              Define el identificador y elige si quieres pintarla o generar una forma inicial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Identificador de Mesa</Label>
              <Input
                id="tableNumber"
                placeholder="Ej: 10, VIP-1, T-01"
                value={formData.tableNumber}
                onChange={(event) => setFormData({ ...formData, tableNumber: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado inicial</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value as TableStatus })}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="createMode">Diseño inicial</Label>
              <Select
                id="createMode"
                value={formData.mode}
                onChange={(event) => setFormData({ ...formData, mode: event.target.value as CreateMode })}
              >
                <option value="paint">Pintar manualmente</option>
                <option value="preset">Generar por asientos</option>
              </Select>
            </div>
            {formData.mode === "preset" && (
              <div className="space-y-2">
                <Label htmlFor="presetSeats">Cantidad de asientos</Label>
                <Input
                  id="presetSeats"
                  type="number"
                  min={1}
                  max={32}
                  value={formData.seats}
                  onChange={(event) =>
                    setFormData({ ...formData, seats: Math.min(32, Math.max(1, Number(event.target.value) || 1)) })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={startDraft} disabled={!formData.tableNumber.trim()}>
              {formData.mode === "preset" ? "Generar mesa" : "Pintar mesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
