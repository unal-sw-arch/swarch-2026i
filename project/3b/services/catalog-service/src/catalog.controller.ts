import { Controller, Get, Patch, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('Catalog (Biblia Pág. 15)')
@ApiBearerAuth()
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('restaurants')
  @ApiOperation({ summary: 'Obtener lista de restaurantes' })
  @ApiResponse({ status: 200, description: 'Retorna la lista de restaurantes disponibles.' })
  async getRestaurants() {
    return this.catalogService.getRestaurants();
  }

  @Get('restaurants/:id/menu')
  @ApiOperation({ summary: 'Obtener el menú de un restaurante' })
  @ApiParam({ name: 'id', example: 10, description: 'ID del restaurante (ej. 10 para Sabor Andino)' })
  @ApiResponse({ status: 200, description: 'Retorna el menú completo del restaurante desde Caché o BD.' })
  @ApiResponse({ status: 404, description: '{ "code": "RESTAURANT_NOT_FOUND", "message": "..." }' })
  async getMenu(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        throw new HttpException({ code: 'VALIDATION_ERROR', message: 'Invalid ID format' }, HttpStatus.BAD_REQUEST);
    }
    const result = await this.catalogService.getMenu(parsedId);
    if (!result) {
        throw new HttpException({ code: 'RESTAURANT_NOT_FOUND', message: 'Menu or Restaurant not found' }, HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Patch('menu-items/:id/availability')
  @ApiOperation({ summary: 'Cambiar disponibilidad de un producto' })
  @ApiParam({ name: 'id', example: 101, description: 'ID del producto (ej. 101 para Bandeja Paisa)' })
  @ApiResponse({ status: 200, description: 'Retorna el producto actualizado y emite el evento PRODUCT_AVAILABILITY_CHANGED.' })
  @ApiResponse({ status: 404, description: '{ "code": "MENU_ITEM_NOT_FOUND", "message": "..." }' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() updateDto: UpdateAvailabilityDto,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        throw new HttpException({ code: 'VALIDATION_ERROR', message: 'Invalid ID format' }, HttpStatus.BAD_REQUEST);
    }
    
    const result = await this.catalogService.updateAvailability(parsedId, updateDto.isAvailable);
    if (!result) {
        throw new HttpException({ code: 'MENU_ITEM_NOT_FOUND', message: 'Menu item not found' }, HttpStatus.NOT_FOUND);
    }
    
    return result;
  }
}
