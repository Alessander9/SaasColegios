import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@cole/database';

export class CreateProductCategoryDto {
  @ApiProperty({ example: 'Uniformes Oficiales' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'CAT-UNIF' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Polos, pantalones, faldas y buzos escolares' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateProductVariantInputDto {
  @ApiProperty({ example: 'POLO-EF-T12' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: 'Talla 12' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 45.0 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 50, default: 0 })
  @IsInt()
  stock!: number;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsInt()
  @IsOptional()
  minStock?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'category-uuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: 'Polo de Educación Física' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PROD-POLO-EF' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Polo de algodón 100% pique con insignia bordada' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.cole.app/products/polo-ef.png' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ type: [CreateProductVariantInputDto] })
  @IsArray()
  variants!: CreateProductVariantInputDto[];
}

export class AdjustInventoryDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({ example: 25, description: 'Positive quantity to add stock, negative to subtract' })
  @IsInt()
  deltaQuantity!: number;

  @ApiProperty({ example: 'Ingreso por recepción de lote de fábrica #LOT-402' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty({ example: 2, default: 1 })
  @IsInt()
  quantity!: number;
}

export class CheckoutOrderDto {
  @ApiPropertyOptional({ example: 'student-uuid' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  items!: CreateOrderItemDto[];

  @ApiProperty({ example: 'req-idemp-order-982182' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.ONLINE_GATEWAY })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'PICKUP_AT_SCHOOL', default: 'PICKUP_AT_SCHOOL' })
  @IsString()
  @IsOptional()
  deliveryMethod?: string;

  @ApiPropertyOptional({ example: 'Recoge apoderado Roberto García' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Pedido entregado en secretaría escolar' })
  @IsString()
  @IsOptional()
  notes?: string;
}
