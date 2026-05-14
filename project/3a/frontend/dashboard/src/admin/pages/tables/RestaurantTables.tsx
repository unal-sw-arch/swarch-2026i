import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Trash2, 
  XCircle
} from "lucide-react";

// Componentes de UI
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { tableService } from "@/lib/services/tableServices";
import type { Table as TableType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  OCCUPIED: 'bg-orange-100 text-orange-800 border-orange-200',
  RESERVED: 'bg-blue-100 text-blue-800 border-blue-200',
  CLEANING: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Libre',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
  CLEANING: 'Limpieza',
};

export const TablesPage = () => {
  // 1. Obtenemos el restaurantId del contexto
  const { restaurantId } = useAuth();  
  
  // --- ESTADOS ---
  const [tables, setTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    seats: 2
  });

  // --- CARGA DE DATOS ---
  const loadTables = async () => {
    // Si entramos aquí y restaurantId es null, salimos para evitar el error de TS
    if (restaurantId === null) return;

    setIsRefreshing(true);
    try {
      const data = await tableService.getByRestaurantId(restaurantId);
      setTables(data);
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

  // --- ACCIONES ---
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantId === null) return; // Validación extra de seguridad

    setIsSubmitting(true);
    try {
      const created = await tableService.create(restaurantId, formData);
      if (created) {
        setTables(prev => [...prev, created]);
        setIsCreateOpen(false);
        setFormData({ tableNumber: '', seats: 2 });
      }
    } catch (error) {
      console.error("Error al crear mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (table: TableType) => {
    const newStatus = table.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";
    const updated = await tableService.updateStatus(table.id, newStatus);
    if (updated) {
      setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: updated.status } : t));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta mesa?")) {
      const ok = await tableService.delete(id);
      if (ok) setTables(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- CONTROL DE RENDERIZADO (Type Guard) ---
  
  // Caso 1: Todavía estamos esperando a que el AuthContext obtenga el ID
  if (restaurantId === null && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <RefreshCw className="animate-spin mb-2" />
        <p>Cargando configuración del restaurante...</p>
      </div>
    );
  }

  // Caso 2: Ya terminó de cargar y el ID sigue siendo null (error de permisos o no tiene restaurante)
  if (restaurantId === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-gray-600">No se encontró un restaurante asociado a tu cuenta de Manager.</p>
      </div>
    );
  }

  // A partir de este punto, TypeScript sabe que restaurantId es SIEMPRE un number.
  return (
    <div className="space-y-6 p-1">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
          <p className="text-gray-600 text-sm">Administra la capacidad y disponibilidad de tu restaurante.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadTables} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} /> Nueva Mesa
          </Button>
        </div>
      </div>

      {/* TABLES LIST SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <RefreshCw className="animate-spin mb-2" />
            Cargando mesas...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">Mesa</TableHead>
                <TableHead className="font-semibold">Capacidad</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                    No hay mesas registradas aún.
                  </TableCell>
                </TableRow>
              ) : (
                tables.map((table) => (
                  <TableRow key={table.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-bold text-gray-900">
                      #{table.tableNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className={table.seats > 4 ? "text-blue-500" : "text-gray-400"} />
                        <span>{table.seats} {table.seats === 1 ? 'asiento' : 'asientos'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`px-2 py-0.5 ${statusColors[table.status]}`}>
                        {statusLabels[table.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(table)}
                          className={table.status === 'AVAILABLE' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {table.status === 'AVAILABLE' ? 'Ocupar' : 'Liberar'}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(table.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* CREATE TABLE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Mesa</DialogTitle>
            <DialogDescription>
              Define el número de identificación y la capacidad de personas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTable} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Identificador de Mesa</Label>
              <Input 
                id="tableNumber" 
                placeholder="Ej: 10, VIP-1, T-01" 
                value={formData.tableNumber}
                onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seats">Cantidad de Asientos</Label>
              <Input 
                id="seats" 
                type="number" 
                min="1" 
                max="20"
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: parseInt(e.target.value) || 0})}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Guardar Mesa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};