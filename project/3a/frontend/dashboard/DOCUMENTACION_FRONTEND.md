# Dashboard ClickAndMunch - Documentación Frontend

##  Resumen del Proyecto

Sistema de gestión de productos y órdenes para el dashboard administrativo de ClickAndMunch. Implementación completa en React + TypeScript con arquitectura lista para conectar con microservicios backend.

**Fecha de implementación:** Diciembre 2025  
**Tecnologías:** React 19, TypeScript, Vite, TailwindCSS, Lucide Icons

---

##  Funcionalidades Implementadas

### 1. Gestión de Productos (Menú)

#### CRUD Completo
-  **Crear producto nuevo** con formulario modal
-  **Editar producto existente** 
-  **Eliminar producto** con confirmación
-  **Cambiar estado** (Borrador  Pendiente  Publicado)
-  **Sin gestión de inventario** (como se solicitó)

#### Características
- **Formulario con validación:**
  - Nombre (requerido)
  - Descripción (requerida)
  - Precio (número, mínimo 0)
  - Categoría (10 opciones predefinidas)
  - URL de imagen (con vista previa automática)

- **Filtros avanzados:**
  - Búsqueda por nombre o descripción
  - Filtro por categoría
  - Filtro por estado de publicación
  - Combinación de filtros en tiempo real

- **Interfaz:**
  - Tabla responsiva con imágenes de productos
  - Estados con colores distintivos
  - Botones de acción (Editar/Eliminar)
  - Contador de productos filtrados
  - Modal de confirmación para eliminación

#### Categorías disponibles
1. Bebidas
2. Ensaladas
3. Platos fuertes
4. Postres
5. Aperitivos
6. Sopas
7. Carnes
8. Pescados
9. Vegetariano
10. Vegano

---

### 2. Gestión de Órdenes

#### Funcionalidades principales
-  **Ver detalle completo** de cada orden
-  **Lista de items/productos** con cantidades y precios
-  **Cambio de estado** de órdenes
-  **Gestión de notas** (agregar/editar comentarios)
-  **Filtros múltiples** (búsqueda, estado, canal)

#### Detalle de orden incluye:
- Información del cliente
- Restaurante asignado
- Canal de origen (Reserva / En sitio)
- ETA estimado
- Estado actual con cambio en tiempo real
- Lista detallada de productos:
  - Nombre del producto
  - Cantidad
  - Precio unitario
  - Subtotal
- Total de la orden
- Notas editables
- Fechas de creación y actualización

#### Estados de orden
| Estado | Color | Descripción |
|--------|-------|-------------|
| Preparing | Amarillo | En preparación |
| Ready | Azul | Listo para servir |
| Served | Verde | Servido al cliente |
| Delivered | Verde esmeralda | Entregado |
| Cancelled | Rojo | Cancelado |

#### Filtros
- **Búsqueda:** ID de orden, nombre de cliente, restaurante
- **Estado:** Todos los estados disponibles
- **Canal:** Reserva o En sitio

---

##  Estructura de Archivos

### Componentes UI creados
```
src/components/ui/
 dialog.tsx       # Sistema de modales reutilizables
 select.tsx       # Componente select personalizado
 textarea.tsx     # Área de texto con estilos
 badge.tsx        # Etiquetas de estado con variantes
```

### Tipos TypeScript
```
src/lib/types.ts
```

**Interfaces principales:**
- `Product` - Modelo completo de producto
- `CreateProductDTO` - DTO para crear productos
- `UpdateProductDTO` - DTO para actualizar productos
- `Order` - Modelo completo de orden
- `OrderItem` - Items dentro de una orden
- `CreateOrderDTO` - DTO para crear órdenes
- `UpdateOrderDTO` - DTO para actualizar órdenes
- `ProductStatus` - Estados de producto
- `OrderStatus` - Estados de orden
- `OrderChannel` - Canales de orden

### Servicios (Mock con preparación para backend)
```
src/lib/services/
 productService.ts  # CRUD de productos
 orderService.ts    # CRUD de órdenes
```

### Páginas actualizadas
```
src/admin/pages/
 products/AdminProductsPage.tsx  # Gestión completa de productos
 orders/AdminOrdersPage.tsx      # Gestión completa de órdenes
```

---

##  Integración con Backend

### Arquitectura preparada para microservicios

#### MenuService (Puerto 8082)
```
Base URL: http://localhost:8082/api/menus
```

**Endpoints a conectar:**
- `GET /api/menus` - Listar todos los productos
- `GET /api/menus/{id}` - Obtener producto por ID
- `POST /api/menus` - Crear nuevo producto
- `PUT /api/menus/{id}` - Actualizar producto
- `DELETE /api/menus/{id}` - Eliminar producto

#### OrderService (Puerto 8083)
```
Base URL: http://localhost:8083/api/orders
```

**Endpoints a conectar:**
- `GET /api/orders` - Listar todas las órdenes
- `GET /api/orders/{id}` - Obtener orden por ID
- `POST /api/orders` - Crear nueva orden
- `PUT /api/orders/{id}` - Actualizar orden
- `PUT /api/orders/{id}/status` - Actualizar solo el estado

### Instrucciones de conexión

**En `productService.ts` y `orderService.ts`:**

1. **Descomentar** las líneas marcadas con `// TODO:`
2. **Comentar/eliminar** las implementaciones mock
3. **Verificar** que los endpoints del backend coincidan
4. **Agregar** manejo de autenticación si es necesario

**Ejemplo:**
```typescript
// MOCK (eliminar)
async getAll(): Promise<Product[]> {
  await delay(300);
  return [...mockProducts];
}

// REAL (descomentar y ajustar)
async getAll(): Promise<Product[]> {
  const response = await fetch('http://localhost:8082/api/menus');
  return response.json();
}
```

---

##  Diseño y UX

### Paleta de colores
- **Primario:** Azul (#3B82F6)
- **Éxito:** Verde (#10B981)
- **Advertencia:** Amarillo/Ámbar (#F59E0B)
- **Error:** Rojo (#EF4444)
- **Neutral:** Grises (#6B7280, #F9FAFB)

### Componentes reutilizables
- Botones con variantes (primary, outline, destructive, ghost)
- Inputs y labels con estilos consistentes
- Modales con overlay y animaciones
- Tablas responsivas con scroll horizontal
- Badges con colores semánticos

### Responsividad
-  Desktop (1024px+)
-  Tablet (768px - 1023px)
-  Mobile (320px - 767px)

---

##  Datos Mock Incluidos

### Productos de ejemplo (4 items)
```javascript
[
  {
    id: 'PRD-001',
    name: 'Latte Vainilla',
    description: 'Delicioso café latte con jarabe de vainilla natural',
    price: 4.50,
    category: 'Bebidas',
    status: 'Publicado'
  },
  {
    id: 'PRD-002',
    name: 'Ensalada Mediterránea',
    description: 'Mezcla fresca de vegetales con queso feta y aceitunas',
    price: 9.80,
    category: 'Ensaladas',
    status: 'Pendiente'
  },
  {
    id: 'PRD-003',
    name: 'Burger Doble',
    description: 'Hamburguesa doble con queso cheddar, lechuga y tomate',
    price: 12.00,
    category: 'Platos fuertes',
    status: 'Publicado'
  },
  {
    id: 'PRD-004',
    name: 'Cheesecake Frutos Rojos',
    description: 'Pastel de queso cremoso con salsa de frutos rojos',
    price: 6.40,
    category: 'Postres',
    status: 'Borrador'
  }
]
```

### Órdenes de ejemplo (2 items)
```javascript
[
  {
    id: 'ORD-9001',
    customer: 'Ana Ríos',
    restaurant: 'Urban Bistro',
    channel: 'Reservation',
    status: 'Preparing',
    total: 48.20,
    items: [
      { productName: 'Latte Vainilla', quantity: 2, unitPrice: 4.50 },
      { productName: 'Burger Doble', quantity: 3, unitPrice: 12.00 }
    ]
  },
  {
    id: 'ORD-9002',
    customer: 'Carlos Mendez',
    restaurant: 'Café Andino',
    channel: 'Reservation',
    status: 'Ready',
    total: 28.50,
    items: [
      { productName: 'Ensalada Mediterránea', quantity: 2, unitPrice: 9.80 },
      { productName: 'Latte Vainilla', quantity: 2, unitPrice: 4.50 }
    ]
  }
]
```

---

##  Cómo ejecutar

### Requisitos previos
- Node.js 18+
- npm o bun

### Instalación
```bash
cd frontend/dashboard
npm install
```

### Desarrollo
```bash
npm run dev
```
Abre http://localhost:5173/

### Build para producción
```bash
npm run build
npm run preview
```

---

##  Notas importantes

### Decisiones de diseño

1. **Sin gestión de inventario:** 
   - Los productos NO tienen stock/inventario
   - Solo se muestran en el menú
   - Columna "Inventario" muestra "N/A"

2. **Órdenes vinculadas a reservas:**
   - Canal puede ser "Reservation" o "In-person"
   - Las órdenes están ligadas al sistema de reservas
   - Seguimiento de estado completo

3. **Datos en memoria (Mock):**
   - Los cambios persisten durante la sesión
   - Al recargar la página, vuelven a los valores iniciales
   - Esto es temporal hasta conectar con backend

4. **Arquitectura preparada:**
   - Todos los servicios tienen TODOs claros
   - Estructura lista para fetch/axios
   - DTOs definidos según especificaciones

### Limitaciones conocidas
- Los datos no persisten al recargar (es mock)
- No hay autenticación implementada en servicios
- No hay manejo de errores HTTP avanzado
- Las imágenes dependen de URLs externas

---

##  Próximos pasos

### Corto plazo
1. Conectar servicios con backend real
2. Implementar autenticación (JWT)
3. Agregar loading states más elaborados
4. Implementar toasts para notificaciones

### Mediano plazo
1. Agregar paginación para listas largas
2. Implementar búsqueda avanzada
3. Agregar exportación de datos (CSV/PDF)
4. Crear dashboard con estadísticas

### Largo plazo
1. Sistema de roles y permisos
2. Historial de cambios (audit log)
3. Notificaciones en tiempo real (WebSockets)
4. Reportes y analytics

---

##  Equipo de desarrollo

**Frontend:** Implementado para IngesoftII  
**Rama:** front-ui-sajo  
**Repositorio:** msbetancourtge/ClickAndMunch

---

##  Soporte

Para dudas o problemas:
1. Revisar los TODOs en los archivos de servicios
2. Verificar la consola del navegador para errores
3. Comprobar que el servidor de desarrollo esté corriendo
4. Limpiar caché: `npm cache clean --force`

---

##  Licencia

Este proyecto es parte del desarrollo académico de Ingeniería de Software II.

---

**Última actualización:** Diciembre 12, 2025
