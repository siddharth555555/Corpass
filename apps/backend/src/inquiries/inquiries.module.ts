import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, JwtModule, NotificationsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService]
})
export class InquiriesModule {}
