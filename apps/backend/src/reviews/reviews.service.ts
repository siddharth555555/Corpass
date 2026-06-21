import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: {
    orderId: number;
    reviewerId: number;
    reviewerRole: Role;
    rating: number;
    title?: string;
    comment?: string;
    productRating?: number;
    productComment?: string;
  }) {
    // 1. Fetch order to validate
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { sellerProfile: true }
    });

    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    if (order.status !== 'DELIVERED') {
      throw new HttpException('Can only review DELIVERED orders', HttpStatus.BAD_REQUEST);
    }

    // 2. Validate reviewer is part of the order
    let revieweeId: number;
    
    if (data.reviewerRole === 'BUYER') {
      if (order.buyerId !== data.reviewerId) {
        throw new HttpException('Not authorized to review this order as buyer', HttpStatus.FORBIDDEN);
      }
      revieweeId = order.sellerProfile.userId; // Rating the seller
    } else {
      // SELLER
      if (order.sellerProfile.userId !== data.reviewerId) {
        throw new HttpException('Not authorized to review this order as seller', HttpStatus.FORBIDDEN);
      }
      revieweeId = order.buyerId; // Rating the buyer
    }

    // 3. Create review (Prisma @@unique ensures no duplicates)
    try {
      const review = await this.prisma.review.create({
        data: {
          orderId: data.orderId,
          reviewerId: data.reviewerId,
          revieweeId: revieweeId,
          reviewerRole: data.reviewerRole,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          productRating: data.productRating,
          productComment: data.productComment
        }
      });
      return review;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint violation
        throw new HttpException('You have already reviewed this order', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async getReviewsForUser(userId: number) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, city: true, company: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserReviewStats(userId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true }
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
    }

    let sum = 0;
    const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    for (const r of reviews) {
      sum += r.rating;
      distribution[r.rating.toString()]++;
    }

    return {
      averageRating: Number((sum / totalReviews).toFixed(1)),
      totalReviews,
      distribution
    };
  }

  async getReviewsForOrder(orderId: number) {
    return this.prisma.review.findMany({
      where: { orderId }
    });
  }
}
