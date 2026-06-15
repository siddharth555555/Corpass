import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

let pincodesData: Record<string, {lat: number, lon: number}> | null = null;
try {
  const fileData = fs.readFileSync(path.join(__dirname, '../../src/resources/pincodes.json'), 'utf-8');
  pincodesData = JSON.parse(fileData);
} catch (e) {
  console.warn('Could not load pincodes.json. Distance checks will fail or fallback.');
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export function calculateDistanceKm(pin1: string | null | undefined, pin2: string | null | undefined): number {
  if (!pin1 || !pin2 || !pincodesData) return Infinity;
  const loc1 = pincodesData[pin1];
  const loc2 = pincodesData[pin2];
  if (!loc1 || !loc2) return Infinity;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(loc2.lat - loc1.lat);  
  const dLon = deg2rad(loc2.lon - loc1.lon); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new BadRequestException('Seller profile not found');
    }

    return this.prisma.productCatalog.create({
      data: {
        sellerProfileId: sellerProfile.id,
        name: data.name,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory,
        priceType: data.priceType,
        price: data.price ? parseFloat(data.price) : null,
        pricingUnit: data.pricingUnit || 'PIECE',
        piecesPerUnit: data.piecesPerUnit ? parseInt(data.piecesPerUnit, 10) : null,
        isDeliverable: data.isDeliverable !== undefined ? data.isDeliverable : true,
        minQtyPurchase: parseInt(data.minQtyPurchase, 10),
        minAmountPurchase: parseFloat(data.minAmountPurchase),
        deliveryTimeDays: data.deliveryTimeDays ? parseInt(data.deliveryTimeDays, 10) : 0,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity, 10) : 0,
        images: data.images || [],
      },
    });
  }

  async findAllBySeller(userId: number) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      return [];
    }

    return this.prisma.productCatalog.findMany({
      where: { sellerProfileId: sellerProfile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMarketplaceProducts(query: any) {
    const { search, category, city, sortBy, buyerPincode, showUndeliverable, minRating } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.sellerProfile = {
        user: {
          city: { contains: city }
        }
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    const products = await this.prisma.productCatalog.findMany({
      where,
      orderBy,
      include: {
        sellerProfile: {
          include: {
            user: {
              include: {
                company: true,
                reviewsReceived: { select: { rating: true } }
              }
            }
          }
        }
      }
    });

    const maxDistanceMap: Record<string, number> = {
      LOCAL_100KM: 100 * 1.2,
      HYPER_LOCAL_20KM: 20 * 1.2,
      SHIPPING_AVAILABLE: Infinity
    };

    const isShowUndeliverable = showUndeliverable === 'true';

    const processedProducts = products.map(p => {
      let isOutOfRange = false;
      if (buyerPincode && p.sellerProfile?.user?.pincode) {
        const dist = calculateDistanceKm(buyerPincode, p.sellerProfile.user.pincode);
        const maxDist = maxDistanceMap[p.sellerProfile.deliveryRange] || Infinity;
        if (dist > maxDist) {
          isOutOfRange = true;
        }
      }
      
      const reviews = p.sellerProfile?.user?.reviewsReceived || [];
      const sellerReviewCount = reviews.length;
      const sellerAvgRating = sellerReviewCount > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviewCount).toFixed(1))
        : 0;

      // Remove reviewsReceived from payload to save bandwidth
      if (p.sellerProfile?.user) {
        delete (p.sellerProfile.user as any).reviewsReceived;
      }

      return {
        ...p,
        isOutOfRange,
        sellerAvgRating,
        sellerReviewCount
      };
    });

    let filtered = processedProducts.filter(p => {
      if (!isShowUndeliverable && p.isOutOfRange) return false;
      if (minRating && p.sellerAvgRating < parseFloat(minRating)) return false;
      return true;
    });

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.sellerAvgRating - a.sellerAvgRating);
    }

    return filtered;
  }

  async updateStock(userId: number, productId: number, stockQuantity: number) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new BadRequestException('Seller profile not found');
    }

    const product = await this.prisma.productCatalog.findUnique({
      where: { id: productId },
    });

    if (!product || product.sellerProfileId !== sellerProfile.id) {
      throw new BadRequestException('Product not found or not owned by seller');
    }

    return this.prisma.productCatalog.update({
      where: { id: productId },
      data: { stockQuantity },
    });
  }
}
