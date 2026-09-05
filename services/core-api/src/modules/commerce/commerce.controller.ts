import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommerceService } from './commerce.service';
import {
  CreateProductCategoryDto,
  CreateProductDto,
  AdjustInventoryDto,
  CheckoutOrderDto,
  UpdateOrderStatusDto,
} from './dto/commerce.dto';
import { AuthGuard } from '../identity/guards/auth.guard';
import { PermissionGuard } from '../identity/guards/permission.guard';
import { RequirePermission, CurrentUser } from '../identity/decorators/auth.decorators';
import { Permissions, AuthenticatedUser } from '@cole/domain-types';
import { OrderStatus } from '@cole/database';

@ApiTags('School Commerce & Store')
@ApiBearerAuth()
@Controller('commerce')
@UseGuards(AuthGuard, PermissionGuard)
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  private extractTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context is required for commerce operations');
    }
    return user.tenantId;
  }

  // --------------------------------------------------
  // CATEGORIES & PRODUCTS
  // --------------------------------------------------

  @Post('categories')
  @RequirePermission(Permissions.COMMERCE_CATALOG_MANAGE)
  @ApiOperation({ summary: 'Create a product category (Uniformes, Libros, Útiles)' })
  createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductCategoryDto
  ) {
    return this.commerceService.createCategory(this.extractTenantId(user), dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories with their products' })
  getCategories(@CurrentUser() user: AuthenticatedUser) {
    return this.commerceService.getCategories(this.extractTenantId(user));
  }

  @Post('products')
  @RequirePermission(Permissions.COMMERCE_CATALOG_MANAGE)
  @ApiOperation({ summary: 'Create a product with initial variants and stock (Emits ProductCreated.v1)' })
  createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto
  ) {
    return this.commerceService.createProduct(this.extractTenantId(user), dto);
  }

  @Get('products')
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiOperation({ summary: 'List products available in the school store' })
  getProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('categoryId') categoryId?: string
  ) {
    return this.commerceService.getProducts(this.extractTenantId(user), categoryId);
  }

  // --------------------------------------------------
  // INVENTORY
  // --------------------------------------------------

  @Post('inventory/adjust')
  @RequirePermission(Permissions.COMMERCE_INVENTORY_MANAGE)
  @ApiOperation({ summary: 'Adjust variant stock quantity (Emits InventoryAdjusted.v1)' })
  adjustInventory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdjustInventoryDto
  ) {
    return this.commerceService.adjustInventory(this.extractTenantId(user), dto);
  }

  // --------------------------------------------------
  // ORDERS & CHECKOUT
  // --------------------------------------------------

  @Post('orders/checkout')
  @ApiOperation({
    summary: 'Checkout order: Deducts inventory stock, creates charge & processes payment in Financial Core',
  })
  checkoutOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutOrderDto
  ) {
    return this.commerceService.checkoutOrder(this.extractTenantId(user), user.id, dto);
  }

  @Get('orders')
  @RequirePermission(Permissions.COMMERCE_ORDERS_VIEW)
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiOperation({ summary: 'List store orders' })
  getOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('userId') userId?: string,
    @Query('status') status?: OrderStatus
  ) {
    return this.commerceService.getOrders(this.extractTenantId(user), userId, status);
  }

  @Patch('orders/:id/status')
  @RequirePermission(Permissions.COMMERCE_ORDERS_PROCESS)
  @ApiOperation({ summary: 'Update order fulfillment status (Preparing, Delivered, Cancelled)' })
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.commerceService.updateOrderStatus(this.extractTenantId(user), orderId, dto);
  }
}
