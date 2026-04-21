import { useEffect, useState } from 'react';
import { Plus, Clock, Timer } from 'lucide-react';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';

import { productService } from '@/lib/services/productService';
import { PRODUCT_CATEGORIES, type Product, type CreateProductDTO } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

const VALID_CATEGORIES = PRODUCT_CATEGORIES;

export const AdminProductsPage = () => {
  const { restaurantId } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState<CreateProductDTO>({
    name: '',
    description: '',
    price: 0,
    category: 'Bebidas',
    image: '',
    availableFrom: '00:00',
    availableTo: '23:59',
    preparationMinutes: '0'
  });

  useEffect(() => {
    loadProducts();
  }, [restaurantId]);

  const loadProducts = async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await productService.getAll(Number(restaurantId));
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        availableFrom: product.availableFrom,
        availableTo: product.availableTo,
        preparationMinutes: product.preparationMinutes || '0'
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Bebidas',
        image: '',
        availableFrom: '00:00',
        availableTo: '23:59',
        preparationMinutes: '0'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await productService.update({ id: editingProduct.id, ...formData });
      } else if (restaurantId) {
        await productService.create(formData, Number(restaurantId));
      }

      await loadProducts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      await loadProducts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Productos</h1>
          <p className="text-slate-500 mt-1">Gestión del catálogo de platos y bebidas.</p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* FILTROS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Buscar</Label>
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50/50 border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Categoría</Label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {VALID_CATEGORIES.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium">
            Cargando catálogo...
          </div>
        ) : (
          <Table>

            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="py-4 font-bold text-slate-700 w-24">Imagen</TableHead>
                <TableHead className="font-bold text-slate-700">Nombre y Descripción</TableHead>
                <TableHead className="font-bold text-slate-700">Precio</TableHead>
                <TableHead className="font-bold text-slate-700">Categoría</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Prep.</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Horario</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id} className="border-slate-100 hover:bg-slate-50/30">

                  <TableCell>
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img
                        src={product.image || 'https://placehold.co/100x100?text=Plato'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{product.name}</span>
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-[400px]">
                        {product.description}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-bold text-slate-700">
                    ${product.price.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {product.category}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-medium">
                      <Timer size={14} />
                      {product.preparationMinutes || 0} min
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-medium">
                      <Clock size={14} />
                      {product.availableFrom?.slice(0, 5)} - {product.availableTo?.slice(0, 5)}
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleOpenDialog(product)}
                        className="text-sm font-bold text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="text-sm font-bold text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        )}
      </div>

      {/* MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              Completa los campos requeridos para el menú.
            </DialogDescription>
          </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* --- Fila 1: Nombre --- */}
                <div className="space-y-1">
                  <Label htmlFor="form-name" className="font-bold text-slate-700">Nombre</Label>
                  <Input
                    id="form-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-50/50"
                  />
                </div>

                {/* --- Fila 2: Descripción --- */}
                <div className="space-y-1">
                  <Label htmlFor="form-desc" className="font-bold text-slate-700">Descripción</Label>
                  <Textarea
                    id="form-desc"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-50/50"
                  />
                </div>

                {/* --- Fila 3: Precio y Tiempo de Preparación (2 columnas) --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="form-price" className="font-bold text-slate-700">Precio</Label>
                    <Input
                      id="form-price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="form-prep" className="font-bold text-slate-700">Prep. (minutos)</Label>
                    <Input
                      id="form-prep"
                      type="number"            
                      placeholder="Ej: 15"
                      value={formData.preparationMinutes}
                      onChange={(e) => setFormData({ ...formData, preparationMinutes: e.target.value })}
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* --- Fila 4: Categoría y Estado Visible --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="form-cat" className="font-bold text-slate-700">Categoría</Label>
                    <select
                      id="form-cat"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {VALID_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>        
                </div>

                {/* --- Fila 5: Horarios de Venta (Sección destacada) --- */}
                <div className="p-3 bg-slate-100 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horario de disponibilidad</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="form-from" className="text-xs font-semibold text-slate-600">Desde</Label>
                      <Input
                        id="form-from"
                        type="time"              
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="form-to" className="text-xs font-semibold text-slate-600">Hasta</Label>
                      <Input
                        id="form-to"
                        type="time"              
                        value={formData.availableTo}
                        onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* --- Fila 6: Imagen --- */}
                <div className="space-y-1">
                  <Label htmlFor="form-img" className="font-bold text-slate-700">URL Imagen</Label>
                  <Input
                    id="form-img"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="bg-slate-50/50"
                  />
                </div>
                {formData.image && (
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Vista Previa</Label>
                    <img src={formData.image} alt="Vista previa" className="max-w-full h-auto rounded-md border border-slate-200" />
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-slate-900 text-white px-8">
                    {editingProduct ? 'Guardar Cambios' : 'Crear Plato'}
                  </Button>
                </DialogFooter>
              </form>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold">
              ¿Eliminar producto?
            </DialogTitle>
            <DialogDescription className="text-center">
              Esta acción borrará el plato permanentemente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="w-full"
            >
              Sí, eliminar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              className="w-full"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};