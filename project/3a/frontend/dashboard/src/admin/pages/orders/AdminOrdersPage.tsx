import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { orderService } from '@/lib/services/orderService';
import type { Order, OrderStatus, OrderChannel } from '@/lib/types';

const statusColors: Record<OrderStatus, string> = {
  Preparing: 'bg-amber-100 text-amber-800',
  Ready: 'bg-blue-100 text-blue-800',
  Served: 'bg-green-100 text-green-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<OrderChannel | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setNotes(order.notes || '');
    setEditingNotes(false);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await orderService.getById(orderId);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.update({ id: selectedOrder.id, notes });
      await loadOrders();
      const updated = await orderService.getById(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = q.length === 0 || order.id.toLowerCase().includes(q) || 
        order.customer.toLowerCase().includes(q) || order.restaurant.toLowerCase().includes(q);
      return matchesStatus && matchesChannel && matchesSearch;
    });
  }, [orders, statusFilter, channelFilter, search]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
        <p className="text-gray-600">Control de órdenes ligadas a reservas (requerimiento: vincular pedido a la reserva y permitir seguimiento de estado).</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <Input id="search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ID, cliente o restaurante..." />
          </div>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="statusFilter">Estado</Label>
              <Select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}>
                <option value="all">Todos los estados</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Served">Served</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="channelFilter">Canal</Label>
              <Select id="channelFilter" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as OrderChannel | 'all')}>
                <option value="all">Todos los canales</option>
                <option value="Reservation">Reserva</option>
                <option value="In-person">En sitio</option>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando órdenes...</div>
        ) : (
          <Table>
            <TableCaption>Seguimiento de órdenes y estados de cocina.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.restaurant}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>{order.eta}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => handleViewDetails(order)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto">
                      <Eye className="w-4 h-4" />Ver
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de Orden {selectedOrder?.id}</DialogTitle>
            <DialogDescription>Información completa de la orden y gestión de estado</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-600">Cliente</Label><p className="font-semibold">{selectedOrder.customer}</p></div>
                <div><Label className="text-gray-600">Restaurante</Label><p className="font-semibold">{selectedOrder.restaurant}</p></div>
                <div><Label className="text-gray-600">Canal</Label><p className="font-semibold">{selectedOrder.channel}</p></div>
                <div><Label className="text-gray-600">ETA</Label><p className="font-semibold">{selectedOrder.eta}</p></div>
                <div><Label className="text-gray-600">Total</Label><p className="font-semibold text-lg">${selectedOrder.total.toFixed(2)}</p></div>
                <div>
                  <Label className="text-gray-600">Estado</Label>
                  <Select value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)} className="mt-1">
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Served">Served</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-900 font-semibold mb-2 block">Items de la Orden</Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Producto</th>
                        <th className="text-center px-4 py-2 text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="text-right px-4 py-2 text-sm font-medium text-gray-700">Precio Unit.</th>
                        <th className="text-right px-4 py-2 text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-3">{item.productName}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-semibold">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-gray-900 font-semibold">Notas</Label>
                  {!editingNotes && <button onClick={() => setEditingNotes(true)} className="text-sm text-blue-600 hover:text-blue-800">Editar</button>}
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agregar notas sobre la orden..." rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNotes}>Guardar</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingNotes(false); setNotes(selectedOrder.notes || ''); }}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedOrder.notes || 'Sin notas'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><Label className="text-gray-500">Creado</Label><p>{formatDate(selectedOrder.createdAt)}</p></div>
                <div><Label className="text-gray-500">Actualizado</Label><p>{formatDate(selectedOrder.updatedAt)}</p></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};