import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
