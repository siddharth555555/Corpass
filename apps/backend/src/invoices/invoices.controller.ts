import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../auth/auth.guard';
import { VerifiedGuard } from '../auth/verified.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
@UseGuards(AuthGuard, VerifiedGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Request() req, @Body() data: CreateInvoiceDto) {
    return this.invoicesService.createManual(req.user.sub, req.user.role, data);
  }

  @Get()
  findAll(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.invoicesService.findAll(req.user.sub, req.user.role, pageNum, limitNum);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Request() req, @Param('id') id: string) {
    return this.invoicesService.acknowledge(req.user.sub, req.user.role, parseInt(id, 10));
  }

  @Patch(':id/dispute')
  dispute(@Request() req, @Param('id') id: string, @Body() data?: { disputeReason?: string, disputeComment?: string }) {
    return this.invoicesService.dispute(req.user.sub, req.user.role, parseInt(id, 10), data);
  }

  @Post(':id/payments')
  addPayment(@Request() req, @Param('id') id: string, @Body() data: { amount: number, paymentDate: string, utr?: string }) {
    return this.invoicesService.addPayment(req.user.sub, req.user.role, parseInt(id, 10), data);
  }

  @Patch('payments/:id/acknowledge')
  acknowledgePayment(@Request() req, @Param('id') id: string) {
    return this.invoicesService.acknowledgePayment(req.user.sub, req.user.role, parseInt(id, 10));
  }

  @Patch('payments/:id/dispute')
  disputePayment(@Request() req, @Param('id') id: string, @Body() data?: { disputeType?: string, disputeComment?: string }) {
    return this.invoicesService.disputePayment(req.user.sub, req.user.role, parseInt(id, 10), data);
  }
}
