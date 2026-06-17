import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    // Service level unique constraints check
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { loginId: data.loginId },
          { email: data.email },
          { mobile: data.mobile }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.loginId === data.loginId) throw new ConflictException('Login ID already exists');
      if (existingUser.email === data.email) throw new ConflictException('Email already exists');
      if (existingUser.mobile === data.mobile) throw new ConflictException('Mobile already exists');
    }

    // Check if role is SELLER
    const isSeller = data.role === 'SELLER';

    let company = null;
    if (!isSeller) {
      const existingCompany = await this.prisma.company.findFirst({
        where: { name: data.companyName }
      });
      // Create Company if Buyer
      company = await this.prisma.company.create({
        data: {
          name: data.companyName,
          address: data.companyAddress,
          type: data.companyType,
          employeeCount: data.employeeCount,
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create User
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        loginId: data.loginId,
        email: data.email,
        mobile: data.mobile,
        password: hashedPassword,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        role: isSeller ? 'SELLER' : 'BUYER',
        companyId: company ? company.id : null,
      }
    });

    if (isSeller) {
      await this.prisma.sellerProfile.create({
        data: {
          userId: user.id,
          gstin: data.gstin,
          deliveryRange: data.deliveryRange || 'LOCAL_100KM',
          deliveryCities: data.deliveryCities || null,
          deliveryPincodes: data.deliveryPincodes || null,
        }
      });
    }

    const payload = { sub: user.id, loginId: user.loginId, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async login(identifier: string, pass: string, role?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { loginId: identifier },
          { mobile: identifier }
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (role && user.role !== role) {
      if (user.role === 'BUYER') {
        throw new UnauthorizedException('This username belongs to a company. Please sign in as a Company.');
      } else {
        throw new UnauthorizedException('This username belongs to a seller. Please sign in as a Seller.');
      }
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, loginId: user.loginId, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true, sellerProfile: true }
    });
    delete user.password;
    return user;
  }

  async updateProfile(userId: number, data: any) {
    const updateData: any = {
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      city: data.city,
      pincode: data.pincode
    };

    if (data.companyName) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }});
      if (user.companyId) {
        await this.prisma.company.update({
          where: { id: user.companyId },
          data: {
            name: data.companyName,
            address: data.companyAddress,
            type: data.companyType,
            employeeCount: data.employeeCount
          }
        });
      }
    }

    if (data.gstin !== undefined || data.deliveryRange !== undefined || data.deliveryCities !== undefined || data.deliveryPincodes !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { sellerProfile: true }});
      if (user.sellerProfile) {
        const profileUpdate: any = {};
        if (data.gstin !== undefined) profileUpdate.gstin = data.gstin;
        if (data.deliveryRange !== undefined) profileUpdate.deliveryRange = data.deliveryRange;
        if (data.deliveryCities !== undefined) profileUpdate.deliveryCities = data.deliveryCities;
        if (data.deliveryPincodes !== undefined) profileUpdate.deliveryPincodes = data.deliveryPincodes;

        await this.prisma.sellerProfile.update({
          where: { id: user.sellerProfile.id },
          data: profileUpdate
        });
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { company: true, sellerProfile: true }
    });
    delete updatedUser.password;
    return updatedUser;
  }
}
