import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('support')
@UseGuards(AuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createQuery(@Request() req, @Body() body: { subject?: string; message: string }) {
    return this.supportService.createSupportQuery(req.user.sub, body.subject, body.message);
  }
}
