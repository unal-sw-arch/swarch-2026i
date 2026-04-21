import { getSession } from '@/lib/auth';
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductStatus
} from '@/lib/types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

interface BackendMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  availableFrom?: string;
  availableTo?: string;
  preparationMinutes?: string;
}

interface BackendMenuCategory {
  id: string;
  restaurantId: number;
  category: string;
}

const FRONTEND_TO_BACKEND_CATEGORY: Record<string, string> = {
  'Bebidas': 'BEBIDA',
  'Ensaladas': 'ENSALADA',
  'Platos fuertes': 'PLATO',
  'Postres': 'POSTRE',
  'Aperitivos': 'ENTRADA',
  'Sopas': 'ENTRADA',
  'Carnes': 'PLATO',
  'Pescados': 'PLATO',
  'Vegetariano': 'PLATO',
  'Vegano': 'ADICIONAL',
};

const BACKEND_TO_FRONTEND_CATEGORY: Record<string, string> = {
  'BEBIDA': 'Bebidas',
  'ENSALADA': 'Ensaladas',
  'PLATO': 'Platos fuertes',
  'POSTRE': 'Postres',
  'ENTRADA': 'Aperitivos',
  'ADICIONAL': 'Vegano',
};

const categoryCache = new Map<string, BackendMenuCategory>();

function authHeaders(): Record<string, string> {
  const session = getSession();
  return {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

// 🔥 Conversión robusta a Product
function toProduct(item: BackendMenuItem, categoryName: string): Product {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    category: categoryName,
    status: 'Publicado',
    image: item.imageUrl ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    availableFrom: item.availableFrom ?? '00:00',
    availableTo: item.availableTo ?? '23:59',
    preparationMinutes: item.preparationMinutes,
  };
}

// 🔍 Obtener categoría con cache
async function fetchCategory(categoryId: string): Promise<BackendMenuCategory | null> {
  if (categoryCache.has(categoryId)) return categoryCache.get(categoryId)!;

  const res = await fetch(`${API_BASE}/menu/categories/${categoryId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) return null;

  const cat: BackendMenuCategory = await res.json();
  categoryCache.set(cat.id, cat);
  return cat;
}

// 🔄 Obtener o crear categoría
async function getOrCreateCategory(
  restaurantId: number,
  backendCategory: string
): Promise<string> {

  for (const cat of categoryCache.values()) {
    if (cat.restaurantId === restaurantId && cat.category === backendCategory) {
      return cat.id;
    }
  }

  const res = await fetch(`${API_BASE}/menu/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ restaurantId, category: backendCategory }),
  });

  if (!res.ok) throw new Error('Error creando categoría');

  const newCat: BackendMenuCategory = await res.json();
  categoryCache.set(newCat.id, newCat);
  return newCat.id;
}

export const productService = {

  // 📋 Obtener todos los productos
  async getAll(restaurantId: number): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/menu/restaurants/${restaurantId}/items`, {
      headers: authHeaders(),
    });

    if (!res.ok) return [];

    const items: BackendMenuItem[] = await res.json();

    const uniqueIds = [...new Set(items.map(i => i.categoryId))];
    await Promise.all(uniqueIds.map(fetchCategory));

    return items.map(item => {
      const cat = categoryCache.get(item.categoryId);
      const name = cat
        ? (BACKEND_TO_FRONTEND_CATEGORY[cat.category] ?? cat.category)
        : 'Sin categoría';

      return toProduct(item, name);
    });
  },

  // 🔍 Obtener por ID
  async getById(id: string): Promise<Product | null> {
    const res = await fetch(`${API_BASE}/menu/items/${id}`, {
      headers: authHeaders(),
    });

    if (!res.ok) return null;

    const item: BackendMenuItem = await res.json();
    const cat = await fetchCategory(item.categoryId);

    const categoryName = cat
      ? (BACKEND_TO_FRONTEND_CATEGORY[cat.category] ?? cat.category)
      : 'Sin categoría';

    return toProduct(item, categoryName);
  },

  // ➕ Crear producto
  async create(data: CreateProductDTO, restaurantId: number): Promise<Product> {
    const backendCategory = FRONTEND_TO_BACKEND_CATEGORY[data.category] ?? 'ADICIONAL';
    const categoryId = await getOrCreateCategory(restaurantId, backendCategory);

    const res = await fetch(`${API_BASE}/menu/categories/${categoryId}/items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image,
        availableFrom: data.availableFrom,
        availableTo: data.availableTo,
        preparationMinutes: data.preparationMinutes
          ? Number(data.preparationMinutes)
          : undefined,
      }),
    });

    if (!res.ok) throw new Error('Error al crear producto');

    const item: BackendMenuItem = await res.json();
    return toProduct(item, data.category);
  },

  // ✏️ Actualizar producto
  async update(data: UpdateProductDTO): Promise<Product | null> {
    const body: Record<string, unknown> = {};

    if (data.name !== undefined) body.name = data.name;
    if (data.description !== undefined) body.description = data.description;
    if (data.price !== undefined) body.price = data.price;
    if (data.image !== undefined) body.imageUrl = data.image;
    if (data.availableFrom !== undefined) body.availableFrom = data.availableFrom;
    if (data.availableTo !== undefined) body.availableTo = data.availableTo;
    if (data.preparationMinutes !== undefined) {
      body.preparationMinutes = data.preparationMinutes
        ? Number(data.preparationMinutes)
        : undefined;
    }

    const res = await fetch(`${API_BASE}/menu/items/${data.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const item: BackendMenuItem = await res.json();
    const cat = await fetchCategory(item.categoryId);

    const categoryName = cat
      ? (BACKEND_TO_FRONTEND_CATEGORY[cat.category] ?? cat.category)
      : (data.category ?? 'Sin categoría');

    return toProduct(item, categoryName);
  },

  // 🗑️ Eliminar
  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/menu/items/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    return res.ok;
  },

  // 🔄 Estado (placeholder)
  async updateStatus(id: string, _status: ProductStatus): Promise<Product | null> {
    return this.getById(id);
  },
};