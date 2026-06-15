import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateDistanceKm } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const d = date.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${d}-${rand}`;
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const d = date.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${d}-${rand}`;
  }

  async create(buyerId: number, data: any) {
    const product = await this.prisma.productCatalog.findUnique({
      where: { id: data.productId },
      include: { sellerProfile: { include: { user: true } } }
    });
    if (!product) throw new BadRequestException('Product not found');

    const maxDistanceMap: Record<string, number> = {
      LOCAL_100KM: 100 * 1.2,
      HYPER_LOCAL_20KM: 20 * 1.2,
      SHIPPING_AVAILABLE: Infinity
    };

    if (data.buyerPincode && product.sellerProfile?.user?.pincode) {
      const dist = calculateDistanceKm(data.buyerPincode, product.sellerProfile.user.pincode);
      const maxDist = maxDistanceMap[product.sellerProfile.deliveryRange] || Infinity;
      if (dist > maxDist) {
        throw new BadRequestException('Delivery not available for this location');
      }
    }

    if (!data.shippingAddress || !data.billingAddress) {
      throw new BadRequestException('Shipping and billing addresses are required');
    }

    const unitPrice = parseFloat(data.unitPrice || product.price?.toString() || '0');
    const quantity = parseInt(data.quantity, 10);
    const totalAmount = unitPrice * quantity;

    return this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        buyerId,
        sellerProfileId: product.sellerProfileId,
        productId: product.id,
        productName: product.name,
        pricingUnit: product.pricingUnit,
        unitPrice,
        quantity,
        totalAmount,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        buyerNote: data.buyerNote || null,
        status: 'PLACED',
      },
      include: { buyer: { select: { name: true, email: true, city: true, company: true } }, sellerProfile: { include: { user: { select: { name: true, company: true } } } }, product: true }
    });
  }

  async findAll(userId: number, role: string) {
    if (role === 'BUYER') {
      return this.prisma.order.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sellerProfile: { include: { user: { select: { name: true, company: true, city: true } } } },
          product: true,
          invoice: true,
          reviews: true
        }
      });
    } else {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp) return [];
      return this.prisma.order.findMany({
        where: { sellerProfileId: sp.id },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { name: true, email: true, city: true, company: true } },
          product: true,
          invoice: true,
          reviews: true
        }
      });
    }
  }

  async counterOffer(userId: number, orderId: number, data: any, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    if (order.status !== 'PLACED' && order.status !== 'COUNTER_OFFERED') {
      throw new BadRequestException('Cannot counter-offer on this order');
    }
    
    if (order.latestProposerId === userId) {
      throw new BadRequestException('Wait for the other party to respond before countering again');
    }

    const counterPrice = parseFloat(data.counterPrice);
    const counterQuantity = data.counterQuantity ? parseInt(data.counterQuantity, 10) : (order.counterQuantity || order.quantity);

    return this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          counterPrice,
          counterQuantity,
          counterNote: data.counterNote || null,
          totalAmount: counterPrice * counterQuantity,
          status: 'COUNTER_OFFERED',
          latestProposerId: userId,
        }
      });

      await prisma.orderMessage.create({
        data: {
          orderId,
          senderId: userId,
          type: 'COUNTER_OFFER',
          proposedPrice: counterPrice,
          proposedQuantity: counterQuantity,
          message: data.counterNote || 'Made a counter offer.',
        }
      });

      return updatedOrder;
    });
  }

  async acceptCounter(userId: number, orderId: number, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    if (order.status !== 'COUNTER_OFFERED') throw new BadRequestException('No counter-offer to accept');
    if (order.latestProposerId === userId) throw new BadRequestException('You cannot accept your own counter-offer');

    return this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          unitPrice: order.counterPrice!,
          quantity: order.counterQuantity || order.quantity,
          totalAmount: order.counterPrice!.toNumber() * (order.counterQuantity || order.quantity),
          status: 'CONFIRMED',
          counterPrice: null,
          counterQuantity: null,
          counterNote: null,
          latestProposerId: null,
        }
      });

      await prisma.orderMessage.create({
        data: {
          orderId,
          senderId: userId,
          type: 'ACCEPT',
          message: 'Accepted the counter offer.',
        }
      });

      return updatedOrder;
    });
  }

  async declineCounter(userId: number, orderId: number, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    if (order.status !== 'COUNTER_OFFERED') throw new BadRequestException('No counter-offer to decline');
    if (order.latestProposerId === userId) throw new BadRequestException('You cannot decline your own counter-offer');

    return this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PLACED',
          counterPrice: null,
          counterQuantity: null,
          counterNote: null,
          latestProposerId: null,
        }
      });

      await prisma.orderMessage.create({
        data: {
          orderId,
          senderId: userId,
          type: 'DECLINE',
          message: 'Declined the counter offer.',
        }
      });

      return updatedOrder;
    });
  }

  async addOrderMessage(userId: number, orderId: number, role: string, message: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    return this.prisma.orderMessage.create({
      data: {
        orderId,
        senderId: userId,
        type: 'MESSAGE',
        message,
      },
      include: {
        sender: { select: { name: true, role: true } }
      }
    });
  }

  async getOrderMessages(userId: number, orderId: number, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    return this.prisma.orderMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, role: true } }
      }
    });
  }

  async confirm(userId: number, orderId: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    if (order.status !== 'PLACED') throw new BadRequestException('Can only confirm PLACED orders');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    });
  }

  async ship(userId: number, orderId: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    if (order.status !== 'CONFIRMED') throw new BadRequestException('Can only ship CONFIRMED orders');

    return this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' }
      });

      if (order.productId) {
        await prisma.productCatalog.update({
          where: { id: order.productId },
          data: {
            stockQuantity: { decrement: order.quantity }
          }
        });
      }

      return updatedOrder;
    });
  }

  async deliver(userId: number, orderId: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    if (order.status !== 'SHIPPED') throw new BadRequestException('Can only deliver SHIPPED orders');

    // Update order to delivered
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' }
    });

    // Auto-generate invoice — seller has acknowledged by delivering, buyer must still acknowledge
    await this.prisma.invoice.create({
      data: {
        invoiceNumber: this.generateInvoiceNumber(),
        orderId: order.id,
        createdByUserId: userId,
        buyerId: order.buyerId,
        sellerProfileId: order.sellerProfileId,
        productName: order.productName,
        pricingUnit: order.pricingUnit,
        unitPrice: order.unitPrice,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress || 'Not Provided',
        billingAddress: order.billingAddress || 'Not Provided',
        type: 'AUTO',
        status: 'PENDING',
        sellerAcknowledged: true,
        buyerAcknowledged: false,
      }
    });

    // Auto-generate Asset for the buyer in PERFECT condition
    await this.prisma.asset.create({
      data: {
        userId: order.buyerId,
        name: order.productName,
        type: "Procured Asset",
        quantity: order.quantity,
        condition: 'PERFECT',
        sourceOrderId: order.id
      }
    });

    return updated;
  }

  async cancel(userId: number, orderId: number, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    // Verify ownership
    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel this order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });
  }
}
