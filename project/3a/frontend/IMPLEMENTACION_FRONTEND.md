# Implementación Frontend - Dashboard

## Archivos Creados 

### Componentes UI (rontend/dashboard/src/components/ui/)
- dialog.tsx
- select.tsx  
- textarea.tsx
- badge.tsx

### Tipos (rontend/dashboard/src/lib/types.ts)
Tipos completos para Product y Order con DTOs

### Servicios (rontend/dashboard/src/lib/services/)
- productService.ts - Conecta con MenuService (puerto 8082)
- orderService.ts - Conecta con OrderService (puerto 8083)

## Archivos por Actualizar Manualmente

### 1. AdminProductsPage.tsx
Ubicación: \rontend/dashboard/src/admin/pages/products/AdminProductsPage.tsx\

Características a implementar:
-  Modal para crear/editar productos
-  Eliminación de productos con confirmación
-  Cambio de estado (Borrador/Pendiente/Publicado)
-  Filtros por búsqueda, categoría y estado
-  Sin gestión de stock/inventario
-  Integración con productService

### 2. AdminOrdersPage.tsx  
Ubicación: \rontend/dashboard/src/admin/pages/orders/AdminOrdersPage.tsx\

Características a implementar:
-  Vista detallada de orden con items
-  Cambio de estado de órdenes
-  Agregar/editar notas
-  Filtros mejorados
-  Integración con orderService

## Conexión con Backend

### MenuService (Puerto 8082)
- GET /api/menus - Listar productos
- GET /api/menus/{id} - Obtener producto
- POST /api/menus - Crear producto
- PUT /api/menus/{id} - Actualizar producto
- DELETE /api/menus/{id} - Eliminar producto

### OrderService (Puerto 8083)
- GET /api/orders - Listar órdenes
- GET /api/orders/{id} - Obtener orden
- POST /api/orders - Crear orden
- PUT /api/orders/{id} - Actualizar orden
- PUT /api/orders/{id}/status - Actualizar estado

## Notas Importantes

- NO hay gestión de stock/inventario
- Los productos solo se muestran en el menú
- Las órdenes están vinculadas a reservas
- Estados de orden: Preparing, Ready, Served, Delivered, Cancelled
- Estados de producto: Borrador, Pendiente, Publicado

## TODO para Backend

Cuando el backend esté listo, descomentar las líneas marcadas con TODO en:
- \productService.ts\
- \orderService.ts\

Y comentar/eliminar las implementaciones mock.

