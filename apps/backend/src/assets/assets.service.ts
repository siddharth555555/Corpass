import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetCondition } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async getAssets(userId: number) {
    return this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sourceOrder: true
      }
    });
  }

  async createAsset(userId: number, data: { name: string; type: string; quantity: number; condition: AssetCondition; notes?: string; sourceOrderId?: number }) {
    return this.prisma.asset.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        quantity: Number(data.quantity),
        condition: data.condition,
        notes: data.notes,
        sourceOrderId: data.sourceOrderId
      }
    });
  }

  async updateAsset(userId: number, assetId: number, data: { condition?: AssetCondition; quantity?: number; notes?: string }) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.userId !== userId) throw new NotFoundException('Asset not found');

    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        ...data,
        quantity: data.quantity ? Number(data.quantity) : undefined
      }
    });
  }

  async deleteAsset(userId: number, assetId: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.userId !== userId) throw new NotFoundException('Asset not found');

    return this.prisma.asset.delete({
      where: { id: assetId }
    });
  }
}
