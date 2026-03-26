import type { Product, CreateProductDTO, UpdateProductDTO, ProductStatus } from '@/lib/types';

// TODO: Conectar con el backend - MenuService (puerto 8082)
// URL base: http://localhost:8082/api/menus

// Datos mock mientras se conecta con el backend
let mockProducts: Product[] = [
  {
    id: 'PRD-001',
    name: 'Latte Vainilla',
    description: 'Delicioso café latte con jarabe de vainilla natural',
    price: 4.50,
    category: 'Bebidas',
    status: 'Publicado',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&auto=format',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'PRD-002',
    name: 'Ensalada Mediterránea',
    description: 'Mezcla fresca de vegetales con queso feta y aceitunas',
    price: 9.80,
    category: 'Ensaladas',
    status: 'Pendiente',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop&auto=format',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'PRD-003',
    name: 'Burger Doble',
    description: 'Hamburguesa doble con queso cheddar, lechuga y tomate',
    price: 12.00,
    category: 'Platos fuertes',
    status: 'Publicado',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop&auto=format',
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
  },
  {
    id: 'PRD-004',
    name: 'Cheesecake Frutos Rojos',
    description: 'Pastel de queso cremoso con salsa de frutos rojos',
    price: 6.40,
    category: 'Postres',
    status: 'Borrador',
    image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&h=400&fit=crop&auto=format',
    createdAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-04T10:00:00Z',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  async getAll(): Promise<Product[]> {
    await delay(300);
    return [...mockProducts];
  },

  async getById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find(p => p.id === id) || null;
  },

  async create(data: CreateProductDTO): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      ...data,
      id: `PRD-${String(mockProducts.length + 1).padStart(3, '0')}`,
      status: 'Borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async update(data: UpdateProductDTO): Promise<Product | null> {
    await delay(500);
    const index = mockProducts.findIndex(p => p.id === data.id);
    if (index === -1) return null;
    mockProducts[index] = {
      ...mockProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockProducts.splice(index, 1);
    return true;
  },

  async updateStatus(id: string, status: ProductStatus): Promise<Product | null> {
    return this.update({ id, status });
  },
};