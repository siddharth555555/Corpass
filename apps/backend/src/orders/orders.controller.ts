import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.ordersService.create(req.user.sub, data);
  }

  @Get()
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.sub, req.user.role);
  }

  @Patch(':id/counter')
  counterOffer(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.ordersService.counterOffer(req.user.sub, parseInt(id, 10), data, req.user.role);
  }

  @Patch(':id/accept')
  acceptCounter(@Request() req, @Param('id') id: string) {
    return this.ordersService.acceptCounter(req.user.sub, parseInt(id, 10), req.user.role);
  }

  @Patch(':id/decline-counter')
  declineCounter(@Request() req, @Param('id') id: string) {
    return this.ordersService.declineCounter(req.user.sub, parseInt(id, 10), req.user.role);
  }

  @Get(':id/messages')
  getOrderMessages(@Request() req, @Param('id') id: string) {
    return this.ordersService.getOrderMessages(req.user.sub, parseInt(id, 10), req.user.role);
  }

  @Post(':id/messages')
  addOrderMessage(@Request() req, @Param('id') id: string, @Body() data: { message: string }) {
    return this.ordersService.addOrderMessage(req.user.sub, parseInt(id, 10), req.user.role, data.message);
  }

  @Patch(':id/confirm')
  confirm(@Request() req, @Param('id') id: string) {
    return this.ordersService.confirm(req.user.sub, parseInt(id, 10));
  }

  @Patch(':id/ship')
  ship(@Request() req, @Param('id') id: string) {
    return this.ordersService.ship(req.user.sub, parseInt(id, 10));
  }

  @Patch(':id/deliver')
  deliver(@Request() req, @Param('id') id: string) {
    return this.ordersService.deliver(req.user.sub, parseInt(id, 10));
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancel(req.user.sub, parseInt(id, 10), req.user.role);
  }

  @Patch(':id/request-advance')
  requestAdvance(@Request() req, @Param('id') id: string, @Body() data: { amount: number }) {
    return this.ordersService.requestAdvance(req.user.sub, parseInt(id, 10), data.amount);
  }

  @Post(':id/payments')
  addPayment(@Request() req, @Param('id') id: string, @Body() data: { amount: number, paymentDate: string, utr?: string }) {
    return this.ordersService.addPayment(req.user.sub, parseInt(id, 10), data);
  }

  @Patch('/payments/:id/acknowledge')
  acknowledgePayment(@Request() req, @Param('id') id: string) {
    return this.ordersService.acknowledgePayment(req.user.sub, parseInt(id, 10));
  }

  @Patch('/payments/:id/dispute')
  disputePayment(@Request() req, @Param('id') id: string) {
    return this.ordersService.disputePayment(req.user.sub, parseInt(id, 10));
  }
}
