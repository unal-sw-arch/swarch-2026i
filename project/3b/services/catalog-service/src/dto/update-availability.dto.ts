import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Estado de disponibilidad del producto',
    example: false,
  })
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable: boolean;
}
