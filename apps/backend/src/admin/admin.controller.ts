import { Controller, Get, UseGuards, Request, Patch, Param, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('orders')
  getOrders() {
    return this.adminService.getOrders();
  }

  @Get('products')
  getProducts() {
    return this.adminService.getProducts();
  }

  @Get('tickets')
  getTickets() {
    return this.adminService.getTickets();
  }

  @Get('tickets/:id')
  getTicket(@Param('id') id: string) {
    return this.adminService.getTicket(parseInt(id, 10));
  }

  @Post('tickets/:id/reply')
  replyToTicket(@Request() req, @Param('id') id: string, @Body() body: { message: string }) {
    return this.adminService.replyToTicket(parseInt(id, 10), req.user.sub, body.message);
  }

  @Patch('tickets/:id/status')
  updateTicketStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateTicketStatus(parseInt(id, 10), body.status);
  }

  @Get('users/pending')
  getPendingSellers() {
    return this.adminService.getPendingSellers();
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(parseInt(id, 10));
  }
}
