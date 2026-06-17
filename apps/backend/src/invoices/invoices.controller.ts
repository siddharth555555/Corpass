import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('invoices')
@UseGuards(AuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.invoicesService.createManual(req.user.sub, req.user.role, data);
  }

  @Get()
  findAll(@Request() req) {
    return this.invoicesService.findAll(req.user.sub, req.user.role);
  }

  @Patch(':id/acknowledge')
  acknowledge(@Request() req, @Param('id') id: string) {
    return this.invoicesService.acknowledge(req.user.sub, req.user.role, parseInt(id, 10));
  }

  @Patch(':id/dispute')
  dispute(@Request() req, @Param('id') id: string) {
    return this.invoicesService.dispute(req.user.sub, req.user.role, parseInt(id, 10));
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
  disputePayment(@Request() req, @Param('id') id: string) {
    return this.invoicesService.disputePayment(req.user.sub, req.user.role, parseInt(id, 10));
  }
}
