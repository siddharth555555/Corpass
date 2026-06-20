import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, BadRequestException, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
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
  findAll(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    if (req.user.role !== 'SELLER') {
      throw new BadRequestException('Only sellers can view their products via this endpoint');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.productsService.findAllBySeller(req.user.sub, pageNum, limitNum);
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

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateProductDto: any) {
    if (req.user.role !== 'SELLER') {
      throw new BadRequestException('Only sellers can update products');
    }
    return this.productsService.update(req.user.sub, parseInt(id, 10), updateProductDto);
  }
}
