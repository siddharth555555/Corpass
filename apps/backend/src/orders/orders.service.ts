import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateDistanceKm } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService) {}

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

    const result = await this.prisma.order.create({
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
        paymentMode: data.paymentMode || null,
        status: 'PLACED',
      },
      include: { buyer: { select: { name: true, email: true, city: true, company: true } }, sellerProfile: { include: { user: { select: { name: true, company: true } } } }, product: true }
    });

    const sp = await this.prisma.sellerProfile.findUnique({ where: { id: product.sellerProfileId }, select: { userId: true } });
    if (sp) {
      await this.notifications.create(sp.userId, 'ORDER_UPDATE', 'New Order Received', `You have received a new order for ${product.name}.`, 'ORDER', result.id.toString());
    }

    return result;
  }

  async findAll(userId: number, role: string) {
    if (role === 'BUYER') {
      return this.prisma.order.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sellerProfile: { include: { user: { select: { name: true, company: true, city: true, email: true, mobile: true } } } },
          product: true,
          invoice: true,
          reviews: true,
          payments: { orderBy: { createdAt: 'desc' } }
        }
      });
    } else {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp) return [];
      return this.prisma.order.findMany({
        where: { sellerProfileId: sp.id },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { name: true, email: true, mobile: true, city: true, company: true } },
          product: true,
          invoice: true,
          reviews: true,
          payments: { orderBy: { createdAt: 'desc' } }
        }
      });
    }
  }

  async requestAdvance(userId: number, orderId: number, amount: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    if (!['PLACED', 'COUNTER_OFFERED', 'CONFIRMED'].includes(order.status)) {
      throw new BadRequestException('Cannot request advance at this stage');
    }
    
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { advanceRequested: amount }
    });
    await this.notifications.create(order.buyerId, 'ORDER_UPDATE', 'Advance Requested', `Supplier has requested an advance of ₹${amount}.`, 'ORDER', orderId.toString());
    return updated;
  }

  async addPayment(userId: number, orderId: number, data: { amount: number, paymentDate: string, utr?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.buyerId !== userId) throw new ForbiddenException('Not your order');
    
    const result = await this.prisma.paymentRecord.create({
      data: {
        orderId,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        utr: data.utr || null,
        status: 'PENDING_ACKNOWLEDGEMENT'
      }
    });

    const sp = await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId }, select: { userId: true } });
    if (sp) {
      await this.notifications.create(sp.userId, 'ORDER_UPDATE', 'Payment Recorded', `Buyer has recorded a payment of ₹${data.amount}.`, 'ORDER', orderId.toString());
    }

    return result;
  }

  async acknowledgePayment(userId: number, paymentId: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    
    const payment = await this.prisma.paymentRecord.findUnique({ where: { id: paymentId }, include: { order: true } });
    if (!payment || payment.order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your payment record');
    
    const result = await this.prisma.paymentRecord.update({
      where: { id: paymentId },
      data: { status: 'ACKNOWLEDGED' }
    });
    await this.notifications.create(payment.order.buyerId, 'ORDER_UPDATE', 'Payment Acknowledged', `Supplier has acknowledged your payment of ₹${payment.amount}.`, 'ORDER', payment.orderId.toString());
    return result;
  }

  async disputePayment(userId: number, paymentId: number, data?: { disputeType?: string, disputeComment?: string }) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    
    const payment = await this.prisma.paymentRecord.findUnique({ where: { id: paymentId }, include: { order: true } });
    if (!payment || payment.order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your payment record');
    
    const updatedPayment = await this.prisma.paymentRecord.update({
      where: { id: paymentId },
      data: { 
        status: 'DISPUTED',
        disputeType: data?.disputeType as any,
        disputeComment: data?.disputeComment 
      }
    });

    await this.prisma.orderMessage.create({
      data: {
        orderId: payment.orderId,
        senderId: userId,
        type: 'MESSAGE',
        message: `🚨 Payment of ₹${payment.amount} dated ${payment.paymentDate.toLocaleDateString()} (UTR: ${payment.utr || 'N/A'}) has been DISPUTED by the seller. ${data?.disputeType ? `[Reason: ${data.disputeType}] ` : ''}${data?.disputeComment ? `- ${data.disputeComment}` : 'Please verify.'}`,
      }
    });

    await this.notifications.create(payment.order.buyerId, 'ORDER_UPDATE', 'Payment Disputed', `Supplier has disputed your payment of ₹${payment.amount}.`, 'ORDER', payment.orderId.toString());
    return updatedPayment;
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

    const result = await this.prisma.$transaction(async (prisma) => {
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

    const targetUserId = role === 'BUYER' ? (await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId } }))?.userId : order.buyerId;
    if (targetUserId) {
      await this.notifications.create(targetUserId, 'ORDER_UPDATE', 'Counter Offer', `You received a counter offer for ₹${counterPrice}.`, 'ORDER', orderId.toString());
    }

    return result;
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

    const result = await this.prisma.$transaction(async (prisma) => {
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

    const targetUserId = role === 'BUYER' ? (await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId } }))?.userId : order.buyerId;
    if (targetUserId) {
      await this.notifications.create(targetUserId, 'ORDER_UPDATE', 'Offer Accepted', `Your counter offer was accepted.`, 'ORDER', orderId.toString());
    }

    return result;
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

    const result = await this.prisma.$transaction(async (prisma) => {
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

    const targetUserId = role === 'BUYER' ? (await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId } }))?.userId : order.buyerId;
    if (targetUserId) {
      await this.notifications.create(targetUserId, 'ORDER_UPDATE', 'Offer Declined', `Your counter offer was declined.`, 'ORDER', orderId.toString());
    }

    return result;
  }

  async addOrderMessage(userId: number, orderId: number, role: string, message: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    if (role === 'BUYER' && order.buyerId !== userId) throw new ForbiddenException('Not your order');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    }

    const messageRecord = await this.prisma.orderMessage.create({
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

    const targetUserId = role === 'BUYER' ? (await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId } }))?.userId : order.buyerId;
    if (targetUserId) {
      await this.notifications.create(targetUserId, 'MESSAGE', 'New Message', `You have a new message from ${messageRecord.sender.name}.`, 'ORDER', orderId.toString());
    }

    return messageRecord;
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

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    });
    await this.notifications.create(order.buyerId, 'ORDER_UPDATE', 'Order Confirmed', `Your order has been confirmed by the supplier.`, 'ORDER', orderId.toString());
    return updated;
  }

  async ship(userId: number, orderId: number) {
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp) throw new ForbiddenException('Not a seller');
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order || order.sellerProfileId !== sp.id) throw new ForbiddenException('Not your order');
    if (order.status !== 'CONFIRMED') throw new BadRequestException('Can only ship CONFIRMED orders');

    if (order.advanceRequested) {
      const ackPaid = order.payments.filter(p => p.status === 'ACKNOWLEDGED').reduce((sum, p) => sum + Number(p.amount), 0);
      if (ackPaid < Number(order.advanceRequested)) {
        throw new BadRequestException(`Advance of ₹${order.advanceRequested} has not been fully acknowledged yet.`);
      }
    }

    const result = await this.prisma.$transaction(async (prisma) => {
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

    await this.notifications.create(order.buyerId, 'ORDER_UPDATE', 'Order Shipped', `Your order has been shipped.`, 'ORDER', orderId.toString());
    return result;
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

    await this.notifications.create(order.buyerId, 'ORDER_UPDATE', 'Order Delivered', `Your order has been delivered successfully.`, 'ORDER', orderId.toString());
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

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });

    const targetUserId = role === 'BUYER' ? (await this.prisma.sellerProfile.findUnique({ where: { id: order.sellerProfileId } }))?.userId : order.buyerId;
    if (targetUserId) {
      await this.notifications.create(targetUserId, 'ORDER_UPDATE', 'Order Cancelled', `An order was cancelled.`, 'ORDER', orderId.toString());
    }

    return updated;
  }
}
