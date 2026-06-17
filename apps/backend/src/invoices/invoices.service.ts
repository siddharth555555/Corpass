import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private generateInvoiceNumber(): string {
    const date = new Date();
    const d = date.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${d}-${rand}`;
  }

  async createManual(userId: number, role: string, data: any) {
    let buyerId: number;
    let sellerProfileId: number;
    let buyerAck = false;
    let sellerAck = false;

    if (role === 'BUYER') {
      buyerId = userId;
      sellerProfileId = parseInt(data.sellerProfileId, 10);
      buyerAck = true; // creator auto-acknowledges
    } else {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp) throw new ForbiddenException('Not a seller');
      sellerProfileId = sp.id;
      buyerId = parseInt(data.buyerId, 10);
      sellerAck = true; // creator auto-acknowledges
    }

    const unitPrice = parseFloat(data.unitPrice);
    const quantity = parseInt(data.quantity, 10);
    const totalAmount = unitPrice * quantity;

    return this.prisma.invoice.create({
      data: {
        invoiceNumber: this.generateInvoiceNumber(),
        createdByUserId: userId,
        buyerId,
        sellerProfileId,
        productName: data.productName,
        pricingUnit: data.pricingUnit || 'PIECE',
        unitPrice,
        quantity,
        totalAmount,
        type: 'MANUAL',
        status: 'PENDING',
        buyerAcknowledged: buyerAck,
        sellerAcknowledged: sellerAck,
        notes: data.notes || null,
      },
      include: {
        buyer: { select: { name: true, company: true } },
        sellerProfile: { include: { user: { select: { name: true, company: true } } } },
        createdBy: { select: { name: true } }
      }
    });
  }

  async findAll(userId: number, role: string) {
    if (role === 'BUYER') {
      return this.prisma.invoice.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sellerProfile: { include: { user: { select: { name: true, company: true } } } },
          createdBy: { select: { name: true } },
          order: { include: { payments: { orderBy: { createdAt: 'desc' } } } },
          payments: { orderBy: { createdAt: 'desc' } }
        }
      });
    } else {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp) return [];
      return this.prisma.invoice.findMany({
        where: { sellerProfileId: sp.id },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { name: true, company: true } },
          createdBy: { select: { name: true } },
          order: { include: { payments: { orderBy: { createdAt: 'desc' } } } },
          payments: { orderBy: { createdAt: 'desc' } }
        }
      });
    }
  }

  async acknowledge(userId: number, role: string, invoiceId: number) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new BadRequestException('Invoice not found');
    if (invoice.status === 'DISPUTED') throw new BadRequestException('Invoice is disputed');
    if (invoice.status === 'ACKNOWLEDGED') throw new BadRequestException('Invoice is already fully acknowledged');

    // Determine which side is acknowledging
    let updateData: any = {};

    if (role === 'BUYER') {
      if (invoice.buyerId !== userId) throw new ForbiddenException('Not your invoice');
      if (invoice.buyerAcknowledged) throw new BadRequestException('You have already acknowledged this invoice');
      updateData.buyerAcknowledged = true;
      // If seller already acknowledged, mark as fully ACKNOWLEDGED
      if (invoice.sellerAcknowledged) updateData.status = 'ACKNOWLEDGED';
    } else {
      // Seller acknowledging — verify via sellerProfile
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || invoice.sellerProfileId !== sp.id) throw new ForbiddenException('Not your invoice');
      if (invoice.sellerAcknowledged) throw new BadRequestException('You have already acknowledged this invoice');
      updateData.sellerAcknowledged = true;
      // If buyer already acknowledged, mark as fully ACKNOWLEDGED
      if (invoice.buyerAcknowledged) updateData.status = 'ACKNOWLEDGED';
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData
    });
  }

  async dispute(userId: number, role: string, invoiceId: number) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new BadRequestException('Invoice not found');
    if (invoice.status === 'ACKNOWLEDGED') throw new BadRequestException('Cannot dispute an acknowledged invoice');

    // Verify the user is a party to this invoice
    if (role === 'BUYER' && invoice.buyerId !== userId) throw new ForbiddenException('Not your invoice');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || invoice.sellerProfileId !== sp.id) throw new ForbiddenException('Not your invoice');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'DISPUTED' }
    });
  }

  async addPayment(userId: number, role: string, invoiceId: number, data: { amount: number, paymentDate: string, utr?: string }) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new BadRequestException('Invoice not found');
    
    if (role === 'BUYER' && invoice.buyerId !== userId) throw new ForbiddenException('Not your invoice');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || invoice.sellerProfileId !== sp.id) throw new ForbiddenException('Not your invoice');
    }
    
    return this.prisma.paymentRecord.create({
      data: {
        invoiceId,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        utr: data.utr || null,
        status: 'PENDING_ACKNOWLEDGEMENT'
      }
    });
  }

  async acknowledgePayment(userId: number, role: string, paymentId: number) {
    const payment = await this.prisma.paymentRecord.findUnique({ where: { id: paymentId }, include: { invoice: true } });
    if (!payment || !payment.invoiceId) throw new BadRequestException('Payment not found or not linked to an invoice');
    
    if (role === 'BUYER') throw new ForbiddenException('Only sellers can acknowledge payments');
    
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp || payment.invoice.sellerProfileId !== sp.id) throw new ForbiddenException('Not your payment record');
    
    return this.prisma.paymentRecord.update({
      where: { id: paymentId },
      data: { status: 'ACKNOWLEDGED' }
    });
  }

  async disputePayment(userId: number, role: string, paymentId: number) {
    const payment = await this.prisma.paymentRecord.findUnique({ where: { id: paymentId }, include: { invoice: true } });
    if (!payment || !payment.invoiceId) throw new BadRequestException('Payment not found or not linked to an invoice');
    
    if (role === 'BUYER') throw new ForbiddenException('Only sellers can dispute payments');
    
    const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
    if (!sp || payment.invoice.sellerProfileId !== sp.id) throw new ForbiddenException('Not your payment record');
    
    return this.prisma.paymentRecord.update({
      where: { id: paymentId },
      data: { status: 'DISPUTED' }
    });
  }
}
