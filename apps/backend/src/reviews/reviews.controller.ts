import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createReview(@Request() req, @Body() body: any) {
    const userId = req.user.sub;
    const role = req.user.role;
    
    const { orderId, rating, title, comment } = body;
    if (!orderId || !rating) {
      throw new HttpException('orderId and rating are required', HttpStatus.BAD_REQUEST);
    }
    
    return this.reviewsService.createReview({
      orderId: Number(orderId),
      reviewerId: userId,
      reviewerRole: role,
      rating: Number(rating),
      title,
      comment
    });
  }

  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(Number(userId));
  }

  @Get('stats/:userId')
  async getUserReviewStats(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviewStats(Number(userId));
  }

  @UseGuards(AuthGuard)
  @Get('order/:orderId')
  async getOrderReviews(@Param('orderId') orderId: string) {
    return this.reviewsService.getReviewsForOrder(Number(orderId));
  }
}
