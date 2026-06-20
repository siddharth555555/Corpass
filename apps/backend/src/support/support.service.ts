import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportService {
  private readonly logger = new Logger('SupportService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async createSupportQuery(userId: number, subject: string, message: string) {
    const ticket = await this.prisma.supportMessage.create({
      data: {
        userId,
        subject,
        message,
      },
    });

    // Fire-and-forget notification to admins
    this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).then(user => {
      if (user) {
        this.notificationsService.notifyRole(
          'ADMIN',
          'SUPPORT_TICKET',
          'New Support Ticket',
          `${user.name} has raised a new support ticket: ${subject || 'No Subject'}`,
          'SupportTicket',
          ticket.id.toString()
        ).catch(e => this.logger.error('Failed to notify admins for support ticket', e));
      }
    });

    return ticket;
  }

  async getUserTickets(userId: number) {
    return this.prisma.supportMessage.findMany({
      where: { userId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { replies: true }
        }
      }
    });
  }

  async getTicketThread(ticketId: number, userId: number) {
    const ticket = await this.prisma.supportMessage.findFirst({
      where: { id: ticketId, userId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        },
        user: { select: { id: true, name: true, role: true } }
      }
    });
    return ticket;
  }

  async replyToTicket(ticketId: number, userId: number, message: string) {
    // Verify ticket belongs to user
    const parent = await this.prisma.supportMessage.findFirst({
      where: { id: ticketId, userId }
    });
    if (!parent) throw new Error("Ticket not found");

    const reply = await this.prisma.supportMessage.create({
      data: {
        userId,
        message,
        parentId: ticketId
      }
    });
    
    // Notify admins
    this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } }).then(user => {
      if (user) {
        this.notificationsService.notifyRole(
          'ADMIN',
          'SUPPORT_TICKET',
          'New Reply on Ticket',
          `${user.name} replied to ticket #${ticketId}`,
          'SupportTicket',
          ticketId.toString()
        ).catch(e => this.logger.error('Failed to notify admins', e));
      }
    });

    return reply;
  }
}
