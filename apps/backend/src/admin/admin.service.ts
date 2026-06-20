import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const activeBuyers = await this.prisma.user.count({ where: { role: 'BUYER' } });
    const activeSellers = await this.prisma.user.count({ where: { role: 'SELLER' } });
    const totalOrders = await this.prisma.order.count();
    const pendingOrders = await this.prisma.order.count({ where: { status: 'PLACED' } });
    
    const revenueResult = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } }
    });
    const totalRevenue = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) : 0;
    
    const openTickets = await this.prisma.supportMessage.count({ where: { status: 'OPEN' } });
    const activeProducts = await this.prisma.productCatalog.count();

    return {
      totalUsers,
      activeBuyers,
      activeSellers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      openTickets,
      activeProducts,
    };
  }

  async getRecentActivity() {
    // Collect recent users, orders, and tickets and merge them
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, role: true, createdAt: true, company: { select: { name: true } } }
    });

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, orderNumber: true, totalAmount: true, createdAt: true }
    });

    const recentProducts = await this.prisma.productCatalog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, sellerProfile: { select: { user: { select: { company: { select: { name: true } } } } } } }
    });

    let activities = [];

    recentUsers.forEach(u => {
      activities.push({
        id: `user-${u.id}`,
        action: `New ${u.role.toLowerCase()} registered`,
        detail: `${u.name} — ${u.company?.name || 'No Company'}`,
        time: u.createdAt,
      });
    });

    recentOrders.forEach(o => {
      activities.push({
        id: `order-${o.id}`,
        action: `Order placed`,
        detail: `${o.orderNumber} — ₹${Number(o.totalAmount).toLocaleString('en-IN')}`,
        time: o.createdAt,
      });
    });

    recentProducts.forEach(p => {
      activities.push({
        id: `prod-${p.id}`,
        action: `Product listed`,
        detail: `${p.name} — ${p.sellerProfile?.user?.company?.name || 'Seller'}`,
        time: p.createdAt,
      });
    });

    // Sort by most recent
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());

    // Format time roughly (or just let the frontend format it if it prefers, but let's send string)
    return activities.slice(0, 10).map(a => ({
      ...a,
      time: a.time.toISOString(), // let frontend handle "X hours ago" or use a library
    }));
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        company: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      company: u.company?.name || '-',
      city: u.city,
      status: u.role === 'SELLER' && !u.isVerified ? 'pending' : 'active',
      joinedAt: u.createdAt.toISOString().split('T')[0],
    }));
  }

  async getOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        buyer: { include: { company: true } },
        sellerProfile: { include: { user: { include: { company: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyer: o.buyer?.company?.name || o.buyer?.name,
      seller: o.sellerProfile?.user?.company?.name || o.sellerProfile?.user?.name,
      product: o.productName,
      amount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt.toISOString().split('T')[0],
    }));
  }

  async getProducts() {
    const products = await this.prisma.productCatalog.findMany({
      include: {
        sellerProfile: { include: { user: { include: { company: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      seller: p.sellerProfile?.user?.company?.name || p.sellerProfile?.user?.name,
      category: p.category,
      price: p.price ? Number(p.price) : null,
      stock: p.stockQuantity,
      status: 'active',
    }));
  }

  async getTickets() {
    const tickets = await this.prisma.supportMessage.findMany({
      where: { parentId: null },
      include: {
        user: true,
        _count: { select: { replies: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tickets.map(t => ({
      id: t.id,
      subject: t.subject || 'Support Request',
      user: t.user?.name || 'Unknown',
      role: t.user?.role || 'UNKNOWN',
      priority: 'medium',
      status: t.status.toLowerCase(),
      repliesCount: t._count.replies,
      createdAt: t.createdAt.toISOString().split('T')[0],
    }));
  }

  async getTicket(ticketId: number) {
    return this.prisma.supportMessage.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, role: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true, role: true } } }
        }
      }
    });
  }

  async replyToTicket(ticketId: number, adminId: number, message: string) {
    const parent = await this.prisma.supportMessage.findUnique({ where: { id: ticketId } });
    if (!parent) throw new Error("Ticket not found");

    const reply = await this.prisma.supportMessage.create({
      data: {
        userId: adminId,
        message,
        parentId: ticketId
      }
    });

    // We can also update the status to something like IN_PROGRESS or WAITING_ON_USER
    if (parent.status === 'OPEN') {
      await this.prisma.supportMessage.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    return reply;
  }

  async updateTicketStatus(ticketId: number, status: string) {
    return this.prisma.supportMessage.update({
      where: { id: ticketId },
      data: { status }
    });
  }

  async getPendingSellers() {
    const users = await this.prisma.user.findMany({
      where: { role: 'SELLER', isVerified: false },
      include: {
        company: true,
        sellerProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company?.name || '-',
      gstin: u.sellerProfile?.gstin || '-',
      city: u.city,
      joinedAt: u.createdAt.toISOString().split('T')[0],
    }));
  }

  async verifyUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }
}
