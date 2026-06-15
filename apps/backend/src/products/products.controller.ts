import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Request() req, @Body() createProductDto: any) {
    if (req.user.role !== 'SELLER') {
      throw new BadRequestException('Only sellers can create products');
    }
    return this.productsService.create(req.user.sub, createProductDto);
  }

  @Get('marketplace')
  getMarketplaceProducts(@Request() req) {
    // Both buyers and sellers can browse the marketplace
    return this.productsService.getMarketplaceProducts(req.query);
  }

  @Get()
  findAll(@Request() req) {
    if (req.user.role !== 'SELLER') {
      throw new BadRequestException('Only sellers can view their products via this endpoint');
    }
    return this.productsService.findAllBySeller(req.user.sub);
  }

  @Patch(':id/stock')
  updateStock(@Request() req, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'SELLER') {
      throw new BadRequestException('Only sellers can update stock');
    }
    const stockQuantity = parseInt(body.stockQuantity, 10);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      throw new BadRequestException('Invalid stock quantity');
    }
    return this.productsService.updateStock(req.user.sub, parseInt(id, 10), stockQuantity);
  }
}
