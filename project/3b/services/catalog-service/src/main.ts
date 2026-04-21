import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnifiedErrorFilter } from './unified-error.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar el filtro de errores estricto (Pág. 23)
  app.useGlobalFilters(new UnifiedErrorFilter());
  
  // Habilitar validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => Object.values(error.constraints || {}).join(', '));
        return new BadRequestException({ code: 'VALIDATION_ERROR', message: messages });
      },
    }),
  );

  // Configuración de Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Catalog Service API')
    .setDescription('Contratos HTTP oficiales para el Catálogo (Biblia Técnica Pág. 15-16)')
    .setVersion('1.0')
    .addBearerAuth() // Soporte para el token JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // La documentación estará disponible en http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document);
  
  // Habilitar CORS
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
