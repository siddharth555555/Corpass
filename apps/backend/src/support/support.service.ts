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
}
