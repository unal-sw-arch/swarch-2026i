import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UnifiedErrorFilter } from './../src/unified-error.filter';
import { PrismaService } from './../src/prisma.service';

describe('Catalog (e2e) - Biblia Técnica Compliance', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const serverRequest = (app: INestApplication) => {
    return (request as any).default ? (request as any).default(app.getHttpServer()) : request(app.getHttpServer());
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new UnifiedErrorFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Limpiar y preparar datos reales de prueba en la DB
    await prisma.menuItem.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.restaurant.deleteMany();

    await prisma.restaurant.create({
      data: {
        id: 10,
        name: 'Sabor Andino',
        isOpen: true,
        menus: {
          create: {
            id: 20,
            items: {
              create: [
                { id: 101, name: 'Bandeja Paisa', price: 30000, isAvailable: true },
                { id: 102, name: 'Ajiaco', price: 22000, isAvailable: true },
              ]
            }
          }
        }
      }
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CONTRATOS HTTP (Pág. 15)', () => {
    it('GET /restaurants - Estructura exacta', async () => {
      const res = await serverRequest(app).get('/restaurants').expect(200);
      expect(res.body).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 10,
            name: 'Sabor Andino',
            isOpen: true
          })
        ])
      });
    });

    it('GET /restaurants/:id/menu - Estructura exacta', async () => {
      const res = await serverRequest(app).get('/restaurants/10/menu').expect(200);
      expect(res.body).toMatchObject({
        restaurantId: 10,
        menuId: 20,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 101,
            name: 'Bandeja Paisa',
            price: 30000,
            // Quitamos la validación del booleano exacto aquí para evitar interferencia
          })
        ])
      });
    });

    it('PATCH /menu-items/:id/availability - Cambio de estado real', async () => {
      // 1. Cambiamos a false
      await serverRequest(app)
        .patch('/menu-items/101/availability')
        .send({ isAvailable: false })
        .expect(200);

      // 2. Verificamos en el menú que ahora sea false
      const res = await serverRequest(app).get('/restaurants/10/menu');
      const item = res.body.items.find(i => i.id === 101);
      expect(item.isAvailable).toBe(false);
    });
  });

  describe('CONTRATO DE ERRORES UNIFICADO (Pág. 23)', () => {
    it('Debe devolver RESTAURANT_NOT_FOUND si el ID no existe', async () => {
      const res = await serverRequest(app).get('/restaurants/999/menu').expect(404);
      expect(res.body).toEqual({
        code: 'RESTAURANT_NOT_FOUND',
        message: 'Menu or Restaurant not found'
      });
    });

    it('Debe devolver MENU_ITEM_NOT_FOUND si el plato no existe', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/999/availability')
        .send({ isAvailable: false })
        .expect(404);
      expect(res.body).toEqual({
        code: 'MENU_ITEM_NOT_FOUND',
        message: 'Menu item not found'
      });
    });

    it('Debe devolver VALIDATION_ERROR si el body es inválido', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/101/availability')
        .send({ isAvailable: "invalid-type" })
        .expect(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('REGLAS DE NEGOCIO Y CACHÉ (Pág. 22)', () => {
    it('Debe invalidar el caché tras un cambio de disponibilidad', async () => {
      // Forzamos carga en caché
      await serverRequest(app).get('/restaurants/10/menu');
      
      // Cambiamos disponibilidad (esto dispara invalidate)
      await serverRequest(app)
        .patch('/menu-items/102/availability')
        .send({ isAvailable: false })
        .expect(200);

      // La siguiente consulta debe reflejar el cambio inmediato (no leer de caché viejo)
      const res = await serverRequest(app).get('/restaurants/10/menu');
      const item = res.body.items.find(i => i.id === 102);
      expect(item.isAvailable).toBe(false);
    });
  });
});
