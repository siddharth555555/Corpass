import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

const logger = new Logger('ProductsService');
let pincodesData: Record<string, {lat: number, lon: number}> | null = null;
try {
  const fileData = fs.readFileSync(path.join(process.cwd(), 'src/resources/pincodes.json'), 'utf-8');
  pincodesData = JSON.parse(fileData);
} catch (e) {
  logger.warn('Could not load pincodes.json. Distance checks will fail or fallback.');
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
        deliveryRange: data.deliveryRange || null,
        deliveryCities: data.deliveryCities || null,
        deliveryPincodes: data.deliveryPincodes || null,
        minQtyPurchase: parseInt(data.minQtyPurchase, 10),
        minAmountPurchase: parseFloat(data.minAmountPurchase),
        deliveryTimeDays: data.deliveryTimeDays ? parseInt(data.deliveryTimeDays, 10) : 0,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity, 10) : 0,
        images: data.images || [],
      },
    });
  }

  async update(userId: number, productId: number, data: any) {
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

    const updateData: any = {
      name: data.name,
      description: data.description,
      category: data.category,
      subCategory: data.subCategory,
      priceType: data.priceType,
      pricingUnit: data.pricingUnit,
      isDeliverable: data.isDeliverable,
      deliveryRange: data.deliveryRange || null,
      deliveryCities: data.deliveryCities !== undefined ? data.deliveryCities : undefined,
      deliveryPincodes: data.deliveryPincodes !== undefined ? data.deliveryPincodes : undefined,
      images: data.images,
    };

    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
    if (data.piecesPerUnit !== undefined) updateData.piecesPerUnit = data.piecesPerUnit ? parseInt(data.piecesPerUnit, 10) : null;
    if (data.minQtyPurchase !== undefined) updateData.minQtyPurchase = parseInt(data.minQtyPurchase, 10);
    if (data.minAmountPurchase !== undefined) updateData.minAmountPurchase = parseFloat(data.minAmountPurchase);
    if (data.deliveryTimeDays !== undefined) updateData.deliveryTimeDays = parseInt(data.deliveryTimeDays, 10);

    return this.prisma.productCatalog.update({
      where: { id: productId },
      data: updateData,
    });
  }

  async findAllBySeller(userId: number, page: number = 1, limit: number = 20) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.productCatalog.findMany({
        where: { sellerProfileId: sellerProfile.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.productCatalog.count({ where: { sellerProfileId: sellerProfile.id } })
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMarketplaceProducts(query: any) {
    const { search, category, city, sortBy, buyerPincode, showUndeliverable, minRating, page, limit } = query;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

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
        },
        orders: {
          select: {
            reviews: {
              where: { productRating: { not: null } },
              select: { productRating: true }
            }
          }
        }
      }
    });

    const isShowUndeliverable = showUndeliverable === 'true';

    const processedProducts = products.map(p => {
      let isOutOfRange = false;
      const productRange = p.deliveryRange || p.sellerProfile.deliveryRange;
      
      if (productRange === 'LOCAL_100KM') {
        const effectiveCities = (p.deliveryCities as any[]) || (p.sellerProfile.deliveryCities as any[]) || [{ name: p.sellerProfile.user?.city }];
        if (city) {
          if (!effectiveCities.some(c => c.name?.toLowerCase() === city.toLowerCase())) {
            isOutOfRange = true;
          }
        } else if (buyerPincode) {
          const sellerPin = p.sellerProfile.user?.pincode;
          const dist = calculateDistanceKm(sellerPin, buyerPincode);
          // If distance is infinite (pincode not found), we fallback to assuming it's out of range unless the pincodes match
          if (dist > 100 && sellerPin !== buyerPincode) {
            isOutOfRange = true;
          }
        }
      } else if (productRange === 'HYPER_LOCAL_20KM') {
        const effectivePincodes = (p.deliveryPincodes as string[]) || (p.sellerProfile.deliveryPincodes as string[]) || [p.sellerProfile.user?.pincode];
        if (!buyerPincode) {
          isOutOfRange = true;
        } else if (!effectivePincodes.includes(buyerPincode)) {
          // Fallback to checking distance if it's not explicitly in the list
          const sellerPin = p.sellerProfile.user?.pincode;
          const dist = calculateDistanceKm(sellerPin, buyerPincode);
          if (dist > 20 && sellerPin !== buyerPincode) {
            isOutOfRange = true;
          }
        }
      }
      
      const reviews = p.sellerProfile?.user?.reviewsReceived || [];
      const sellerReviewCount = reviews.length;
      const sellerAvgRating = sellerReviewCount > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviewCount).toFixed(1))
        : 0;

      let productReviewCount = 0;
      let productRatingSum = 0;
      if ((p as any).orders) {
        for (const order of (p as any).orders) {
          for (const review of order.reviews || []) {
            if (review.productRating) {
               productRatingSum += review.productRating;
               productReviewCount++;
            }
          }
        }
      }
      const productAvgRating = productReviewCount > 0 ? Number((productRatingSum / productReviewCount).toFixed(1)) : 0;

      // Remove nested arrays to save bandwidth
      if (p.sellerProfile?.user) {
        delete (p.sellerProfile.user as any).reviewsReceived;
      }
      delete (p as any).orders;

      return {
        ...p,
        isOutOfRange,
        sellerAvgRating,
        sellerReviewCount,
        productAvgRating,
        productReviewCount
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

    const total = filtered.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = filtered.slice(skip, skip + limitNum);

    return {
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
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

  async getProductDetails(productId: number) {
    const product = await this.prisma.productCatalog.findUnique({
      where: { id: productId },
      include: {
        sellerProfile: {
          include: {
            user: {
              include: { company: true }
            }
          }
        },
        orders: {
          select: {
            reviews: {
              where: { productRating: { not: null } },
              include: {
                reviewer: { select: { name: true, company: { select: { name: true } } } }
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Process reviews
    let allReviews = [];
    if ((product as any).orders) {
      for (const order of (product as any).orders) {
        for (const review of order.reviews || []) {
          allReviews.push(review);
        }
      }
    }

    const productReviewCount = allReviews.length;
    const productRatingSum = allReviews.reduce((sum, r) => sum + (r.productRating || 0), 0);
    const productAvgRating = productReviewCount > 0 ? Number((productRatingSum / productReviewCount).toFixed(1)) : 0;

    // Sort by rating desc
    allReviews.sort((a, b) => (b.productRating || 0) - (a.productRating || 0));

    // Get top 2 positive (4-5) and top 2 negative (1-3)
    const positiveReviews = allReviews.filter(r => (r.productRating || 0) >= 4).slice(0, 2);
    const negativeReviews = allReviews.filter(r => (r.productRating || 0) < 4).reverse().slice(0, 2); // reverse to get lowest

    delete (product as any).orders;

    return {
      ...product,
      productAvgRating,
      productReviewCount,
      topReviews: {
        positive: positiveReviews,
        negative: negativeReviews
      }
    };
  }

  async getProductReviews(productId: number, page: number = 1, limit: number = 10) {
    // Since reviews are linked via orders, we need to query Reviews where order.productId = productId
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          productRating: { not: null },
          order: { productId }
        },
        include: {
          reviewer: { select: { name: true, company: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.review.count({
        where: {
          productRating: { not: null },
          order: { productId }
        }
      })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
