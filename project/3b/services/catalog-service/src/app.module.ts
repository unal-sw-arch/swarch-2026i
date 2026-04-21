import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { PrismaService } from './prisma.service';
import { CacheService } from './cache.service';
import { EventPublisher } from './event.publisher';

@Module({
  imports: [],
  controllers: [CatalogController],
  providers: [CatalogService, PrismaService, CacheService, EventPublisher],
})
export class AppModule {}
