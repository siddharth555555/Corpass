import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupportQuery(userId: number, subject: string, message: string) {
    return this.prisma.supportMessage.create({
      data: {
        userId,
        subject,
        message,
      },
    });
  }
}
