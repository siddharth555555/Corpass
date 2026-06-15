import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async createInquiry(buyerId: number, data: any) {
    return this.prisma.$transaction(async (prisma) => {
      const inquiry = await prisma.inquiry.create({
        data: {
          buyerId,
          sellerProfileId: data.sellerProfileId,
          productId: data.productId || null,
          customProductRequest: data.customProductRequest || null,
          inquiryType: data.inquiryType,
          buyerMessage: data.buyerMessage,
          status: 'PENDING'
        }
      });

      await prisma.inquiryMessage.create({
        data: {
          inquiryId: inquiry.id,
          senderId: buyerId,
          message: data.buyerMessage,
        }
      });

      return inquiry;
    });
  }

  async getInquiries(userId: number, role: string) {
    if (role === 'BUYER') {
      return this.prisma.inquiry.findMany({
        where: { buyerId: userId },
        include: {
          sellerProfile: { include: { user: true } },
          product: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      const sellerProfile = await this.prisma.sellerProfile.findUnique({
        where: { userId }
      });
      if (!sellerProfile) throw new NotFoundException('Seller profile not found');

      return this.prisma.inquiry.findMany({
        where: { sellerProfileId: sellerProfile.id },
        include: {
          buyer: { include: { company: true } },
          product: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  }

  async respondToInquiry(userId: number, inquiryId: number, data: any) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId }
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: inquiryId }
    });
    if (!inquiry || inquiry.sellerProfileId !== sellerProfile.id) {
      throw new UnauthorizedException('Cannot respond to this inquiry');
    }

    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          sellerResponse: data.sellerResponse,
          responsePrice: data.responsePrice || null,
          status: 'RESPONDED'
        }
      });

      await prisma.inquiryMessage.create({
        data: {
          inquiryId,
          senderId: userId,
          message: data.responsePrice ? `Response: ${data.sellerResponse} \nProposed Price: ₹${data.responsePrice}` : data.sellerResponse,
        }
      });

      return updated;
    });
  }

  async addInquiryMessage(userId: number, inquiryId: number, role: string, message: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    if (role === 'BUYER' && inquiry.buyerId !== userId) throw new UnauthorizedException('Not your inquiry');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || inquiry.sellerProfileId !== sp.id) throw new UnauthorizedException('Not your inquiry');
    }

    return this.prisma.inquiryMessage.create({
      data: {
        inquiryId,
        senderId: userId,
        message,
      },
      include: {
        sender: { select: { name: true, role: true } }
      }
    });
  }

  async getInquiryMessages(userId: number, inquiryId: number, role: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    if (role === 'BUYER' && inquiry.buyerId !== userId) throw new UnauthorizedException('Not your inquiry');
    if (role === 'SELLER') {
      const sp = await this.prisma.sellerProfile.findUnique({ where: { userId } });
      if (!sp || inquiry.sellerProfileId !== sp.id) throw new UnauthorizedException('Not your inquiry');
    }

    return this.prisma.inquiryMessage.findMany({
      where: { inquiryId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, role: true } }
      }
    });
  }

  async getAllSellers() {
    return this.prisma.sellerProfile.findMany({
      include: {
        user: { select: { name: true, city: true } }
      }
    });
  }

  async createSupportQuery(userId: number, message: string) {
    let sellerProfile = await this.prisma.sellerProfile.findFirst();
    if (!sellerProfile) {
      // Create a dummy seller profile if none exists (unlikely in seeded db)
      const user = await this.prisma.user.findFirst({ where: { role: 'SELLER' } });
      if (user) {
        sellerProfile = await this.prisma.sellerProfile.create({
          data: { userId: user.id, gstin: 'SYSTEM_SUPPORT', deliveryRange: 'SHIPPING_AVAILABLE' }
        });
      } else {
        throw new NotFoundException('No support handler profile available in database');
      }
    }

    return this.prisma.$transaction(async (prisma) => {
      const inquiry = await prisma.inquiry.create({
        data: {
          buyerId: userId,
          sellerProfileId: sellerProfile.id,
          productId: null,
          customProductRequest: 'Support Ticket',
          inquiryType: 'QUOTE',
          buyerMessage: message,
          status: 'PENDING'
        }
      });

      await prisma.inquiryMessage.create({
        data: {
          inquiryId: inquiry.id,
          senderId: userId,
          message: message,
        }
      });

      return inquiry;
    });
  }
}
