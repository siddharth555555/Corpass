import { Controller, Post, Get, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @UseGuards(AuthGuard)
  @Post('inquiries')
  async createInquiry(@Request() req, @Body() data: any) {
    // Only BUYER should create, but for simplicity we rely on UI logic or enforce here
    return this.inquiriesService.createInquiry(req.user.sub, data);
  }

  @UseGuards(AuthGuard)
  @Get('inquiries')
  async getInquiries(@Request() req) {
    return this.inquiriesService.getInquiries(req.user.sub, req.user.role);
  }

  @UseGuards(AuthGuard)
  @Patch('inquiries/:id/respond')
  async respondToInquiry(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.inquiriesService.respondToInquiry(req.user.sub, parseInt(id, 10), data);
  }

  @UseGuards(AuthGuard)
  @Get('inquiries/:id/messages')
  async getInquiryMessages(@Request() req, @Param('id') id: string) {
    return this.inquiriesService.getInquiryMessages(req.user.sub, parseInt(id, 10), req.user.role);
  }

  @UseGuards(AuthGuard)
  @Post('inquiries/:id/messages')
  async addInquiryMessage(@Request() req, @Param('id') id: string, @Body() data: { message: string }) {
    return this.inquiriesService.addInquiryMessage(req.user.sub, parseInt(id, 10), req.user.role, data.message);
  }

  @Get('sellers')
  async getAllSellers() {
    return this.inquiriesService.getAllSellers();
  }

  @UseGuards(AuthGuard)
  @Post('support/query')
  async createSupportQuery(@Request() req, @Body() data: { message: string }) {
    return this.inquiriesService.createSupportQuery(req.user.sub, data.message);
  }
}
