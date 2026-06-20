import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerifiedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;
    
    if (!userPayload) return true; // Let AuthGuard handle unauthorized

    // We only verify sellers based on the requirements
    if (userPayload.role !== 'SELLER') return true;

    const user = await this.prisma.user.findUnique({ where: { id: userPayload.sub } });
    if (!user || !user.isVerified) {
      throw new ForbiddenException('Account pending verification. Please contact support.');
    }

    return true;
  }
}
