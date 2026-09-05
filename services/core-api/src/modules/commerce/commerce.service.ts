import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  db,
  withTransactionAndOutbox,
  OrderStatus,
  InventoryMovementType,
  ChargeStatus,
  PaymentStatus,
  PaymentMethod,
} from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateProductCategoryDto,
  CreateProductDto,
  AdjustInventoryDto,
  CheckoutOrderDto,
  UpdateOrderStatusDto,
} from './dto/commerce.dto';

@Injectable()
export class CommerceService {
  // --------------------------------------------------
  // CATEGORIES & PRODUCTS
  // --------------------------------------------------

  async createCategory(tenantId: string, dto: CreateProductCategoryDto): Promise<any> {
    const existing = await db.productCategory.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Category with code ${dto.code} already exists`);
    }

    return await db.productCategory.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    });
  }

  async getCategories(tenantId: string): Promise<any[]> {
    return await db.productCategory.findMany({
      where: { tenantId, isActive: true },
      include: { products: { include: { variants: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(tenantId: string, dto: CreateProductDto): Promise<any> {
    const existing = await db.product.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Product with code ${dto.code} already exists`);
    }

    const productId = uuidv4();
    const productCreatedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'ProductCreated.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: productId,
      version: 1,
      payload: {
        code: dto.code,
        name: dto.name,
        categoryId: dto.categoryId,
        variantsCount: dto.variants.length,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [productCreatedEvent], async (tx) => {
      const product = await (tx as typeof db).product.create({
        data: {
          id: productId,
          tenantId,
          categoryId: dto.categoryId,
          name: dto.name,
          code: dto.code,
          description: dto.description,
          imageUrl: dto.imageUrl,
        },
      });

      for (const v of dto.variants) {
        const variantId = uuidv4();
        await (tx as typeof db).productVariant.create({
          data: {
            id: variantId,
            tenantId,
            productId: product.id,
            sku: v.sku,
            name: v.name,
            price: v.price,
            stock: v.stock,
            minStock: v.minStock || 5,
          },
        });

        if (v.stock > 0) {
          await (tx as typeof db).inventoryMovement.create({
            data: {
              id: uuidv4(),
              tenantId,
              variantId,
              type: InventoryMovementType.PURCHASE_IN,
              quantity: v.stock,
              previousStock: 0,
              newStock: v.stock,
              reason: 'Initial stock intake on product creation',
            },
          });
        }
      }

      return await (tx as typeof db).product.findUnique({
        where: { id: product.id },
        include: { variants: true, category: true },
      });
    });
  }

  async getProducts(tenantId: string, categoryId?: string): Promise<any[]> {
    return await db.product.findMany({
      where: {
        tenantId,
        ...(categoryId ? { categoryId } : {}),
        isActive: true,
      },
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // --------------------------------------------------
  // INVENTORY MOVEMENTS
  // --------------------------------------------------

  async adjustInventory(tenantId: string, dto: AdjustInventoryDto): Promise<any> {
    const variant = await db.productVariant.findFirst({
      where: { id: dto.variantId, tenantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const previousStock = variant.stock;
    const newStock = previousStock + dto.deltaQuantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current stock is ${previousStock}, cannot subtract ${Math.abs(dto.deltaQuantity)}`
      );
    }

    const movementType =
      dto.deltaQuantity > 0 ? InventoryMovementType.PURCHASE_IN : InventoryMovementType.ADJUSTMENT;

    const inventoryEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'InventoryAdjusted.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: variant.id,
      version: 1,
      payload: {
        sku: variant.sku,
        productName: variant.product.name,
        delta: dto.deltaQuantity,
        previousStock,
        newStock,
        reason: dto.reason,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [inventoryEvent], async (tx) => {
      await (tx as typeof db).productVariant.update({
        where: { id: variant.id },
        data: { stock: newStock },
      });

      return await (tx as typeof db).inventoryMovement.create({
        data: {
          id: uuidv4(),
          tenantId,
          variantId: variant.id,
          type: movementType,
          quantity: dto.deltaQuantity,
          previousStock,
          newStock,
          reason: dto.reason,
        },
        include: { variant: { include: { product: true } } },
      });
    });
  }

  // --------------------------------------------------
  // E-COMMERCE CHECKOUT & ORDERS INTEGRATION
  // --------------------------------------------------

  async checkoutOrder(tenantId: string, userId: string, dto: CheckoutOrderDto): Promise<any> {
    const existingOrder = await db.order.findUnique({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey: dto.idempotencyKey } },
      include: { items: { include: { variant: { include: { product: true } } } }, charge: true },
    });
    if (existingOrder) return existingOrder;

    // 1. Verify all variant stock
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await db.productVariant.findMany({
      where: { id: { in: variantIds }, tenantId },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException('One or more product variants were not found');
    }

    let calculatedTotal = 0;
    const itemsToProcess: Array<{
      variant: (typeof variants)[0];
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of dto.items) {
      const v = variants.find((variant) => variant.id === item.variantId)!;
      if (v.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for '${v.product.name} (${v.name})'. Available: ${v.stock}, requested: ${item.quantity}`
        );
      }
      const unitPrice = Number(v.price);
      const totalPrice = unitPrice * item.quantity;
      calculatedTotal += totalPrice;
      itemsToProcess.push({
        variant: v,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // 2. Ensure FeeConcept for Commerce exists
    let feeConcept = await db.feeConcept.findFirst({
      where: { tenantId, code: 'COMMERCE-ORD' },
    });
    if (!feeConcept) {
      feeConcept = await db.feeConcept.create({
        data: {
          tenantId,
          code: 'COMMERCE-ORD',
          name: 'Venta de Tienda Escolar',
          category: 'COMMERCE_ORDER',
          defaultAmount: 0,
        },
      });
    }

    const orderId = uuidv4();
    const orderCode = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const chargeId = uuidv4();
    const chargeCode = `CHG-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderEvents: DomainEvent[] = [
      {
        eventId: uuidv4(),
        eventType: 'OrderCreated.v1',
        occurredAt: new Date().toISOString(),
        tenantId,
        aggregateId: orderId,
        version: 1,
        payload: {
          orderCode,
          userId,
          studentId: dto.studentId,
          totalAmount: calculatedTotal,
        },
      },
    ];

    return await withTransactionAndOutbox(db, tenantId, orderEvents, async (tx) => {
      // Create Financial Charge
      await (tx as typeof db).charge.create({
        data: {
          id: chargeId,
          tenantId,
          conceptId: feeConcept.id,
          studentId: dto.studentId,
          title: `Pedido de Tienda ${orderCode}`,
          code: chargeCode,
          originalAmount: calculatedTotal,
          totalAmount: calculatedTotal,
          paidAmount: calculatedTotal,
          dueDate: new Date(),
          status: ChargeStatus.PAID,
        },
      });

      // Create Order
      const order = await (tx as typeof db).order.create({
        data: {
          id: orderId,
          tenantId,
          userId,
          studentId: dto.studentId,
          chargeId,
          idempotencyKey: dto.idempotencyKey,
          code: orderCode,
          totalAmount: calculatedTotal,
          status: OrderStatus.PAID,
          deliveryMethod: dto.deliveryMethod || 'PICKUP_AT_SCHOOL',
          notes: dto.notes,
        },
      });

      // Create Order Items and Deduct Inventory Stock
      for (const item of itemsToProcess) {
        await (tx as typeof db).orderItem.create({
          data: {
            id: uuidv4(),
            tenantId,
            orderId: order.id,
            variantId: item.variant.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        });

        const updatedStock = item.variant.stock - item.quantity;
        await (tx as typeof db).productVariant.update({
          where: { id: item.variant.id },
          data: { stock: updatedStock },
        });

        await (tx as typeof db).inventoryMovement.create({
          data: {
            id: uuidv4(),
            tenantId,
            variantId: item.variant.id,
            type: InventoryMovementType.SALE_OUT,
            quantity: -item.quantity,
            previousStock: item.variant.stock,
            newStock: updatedStock,
            reason: `Venta por pedido ${orderCode}`,
          },
        });
      }

      // Record Idempotent Payment in Financial Core
      const paymentId = uuidv4();
      await (tx as typeof db).payment.create({
        data: {
          id: paymentId,
          tenantId,
          chargeId,
          idempotencyKey: dto.idempotencyKey,
          code: `PAY-${orderCode}`,
          amount: calculatedTotal,
          method: dto.paymentMethod || PaymentMethod.ONLINE_GATEWAY,
          status: PaymentStatus.COMPLETED,
          notes: `Pago automático de pedido ${orderCode}`,
        },
      });

      // Issue electronic receipt
      await (tx as typeof db).receipt.create({
        data: {
          id: uuidv4(),
          tenantId,
          paymentId,
          receiptNumber: `B002-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'BOLETA',
          recipientName: 'Comprador Tienda',
          recipientDoc: '00000000',
          totalAmount: calculatedTotal,
        },
      });

      return await (tx as typeof db).order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          charge: true,
        },
      });
    });
  }

  async getOrders(tenantId: string, userId?: string, status?: OrderStatus): Promise<any[]> {
    return await db.order.findMany({
      where: {
        tenantId,
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        student: true,
        user: true,
      },
      orderBy: { placedAt: 'desc' },
    });
  }

  async updateOrderStatus(
    tenantId: string,
    orderId: string,
    dto: UpdateOrderStatusDto
  ): Promise<any> {
    const order = await db.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return await db.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        notes: dto.notes ? `${order.notes || ''} | ${dto.notes}` : order.notes,
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
      },
    });
  }
}
