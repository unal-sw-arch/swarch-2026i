import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UnifiedErrorFilter } from './../src/unified-error.filter';

describe('Catalog Compliance (Extra Validation) - Biblia Técnica', () => {
  let app: INestApplication;

  const serverRequest = (app: INestApplication) => {
    return (request as any).default ? (request as any).default(app.getHttpServer()) : request(app.getHttpServer());
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new UnifiedErrorFilter());
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true, // Regla de oro: Ignorar campos no permitidos
      forbidNonWhitelisted: true,
      transform: true 
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ESTÁNDARES GLOBALES (Pág. 11)', () => {
    it('Debe usar siempre formato application/json', async () => {
      const res = await serverRequest(app).get('/restaurants');
      expect(res.header['content-type']).toMatch(/application\/json/);
    });

    it('Rutas deben ser lower-case y sustantivos plurales', async () => {
      // Validamos que la ruta existe tal cual pide la pág 15
      await serverRequest(app).get('/restaurants').expect(200);
    });
  });

  describe('VALIDACIÓN DE ENTRADA (Whitelisting)', () => {
    it('Debe rechazar campos no definidos en el contrato (Security)', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/101/availability')
        .send({ 
          isAvailable: false, 
          hackField: 'trying to inject something' 
        })
        .expect(400); // 400 Bad Request por campo no permitido

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('Debe rechazar isAvailable si no es booleano real', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/101/availability')
        .send({ isAvailable: "true" }) // String en vez de boolean
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('Debe rechazar si el body está vacío', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/101/availability')
        .send({})
        .expect(400);
      
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('FORMATOS DE RESPUESTA (Pág. 15-16)', () => {
    it('GET /restaurants debe devolver un objeto con propiedad "items"', async () => {
      const res = await serverRequest(app).get('/restaurants');
      expect(res.body).toHaveProperty('items');
      expect(res.body.items).toBeInstanceOf(Array);
    });

    it('MenuItem debe tener el campo "price" como número', async () => {
      const res = await serverRequest(app).get('/restaurants/10/menu');
      if (res.body.items.length > 0) {
        expect(typeof res.body.items[0].price).toBe('number');
      }
    });

    it('MenuItem debe tener el campo "isAvailable" como booleano', async () => {
      const res = await serverRequest(app).get('/restaurants/10/menu');
      if (res.body.items.length > 0) {
        expect(typeof res.body.items[0].isAvailable).toBe('boolean');
      }
    });
  });

  describe('REGLAS DE ERROR (Pág. 23)', () => {
    it('Error 404 debe tener estructura code/message', async () => {
      const res = await serverRequest(app).get('/not-found-route').expect(404);
      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
    });

    it('Error 400 debe tener estructura code/message con code VALIDATION_ERROR', async () => {
      const res = await serverRequest(app)
        .patch('/menu-items/abc/availability')
        .send({ isAvailable: true })
        .expect(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
