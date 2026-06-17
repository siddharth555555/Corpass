import { Controller, Get, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
  }

  @Get('stats')
  getDashboardStats(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  getRecentActivity(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getRecentActivity();
  }

  @Get('users')
  getUsers(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getUsers();
  }

  @Get('orders')
  getOrders(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getOrders();
  }

  @Get('products')
  getProducts(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getProducts();
  }

  @Get('tickets')
  getTickets(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getTickets();
  }
}
