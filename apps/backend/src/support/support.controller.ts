import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  async getTickets(@Request() req) {
    return this.supportService.getUserTickets(req.user.sub);
  }

  @Get(':id')
  async getTicketThread(@Request() req, @Param('id') id: string) {
    return this.supportService.getTicketThread(parseInt(id, 10), req.user.sub);
  }

  @Post()
  async createQuery(@Request() req, @Body() body: { subject?: string; message: string }) {
    return this.supportService.createSupportQuery(req.user.sub, body.subject, body.message);
  }

  @Post(':id/reply')
  async replyToTicket(@Request() req, @Param('id') id: string, @Body() body: { message: string }) {
    return this.supportService.replyToTicket(parseInt(id, 10), req.user.sub, body.message);
  }
}
