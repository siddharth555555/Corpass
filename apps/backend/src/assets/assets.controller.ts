import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '../auth/auth.guard';
import { AssetCondition } from '@prisma/client';

@Controller('assets')
@UseGuards(AuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  getAssets(@Request() req) {
    return this.assetsService.getAssets(req.user.sub);
  }

  @Post()
  createAsset(@Request() req, @Body() body: { name: string; type: string; quantity: number; condition: AssetCondition; notes?: string; sourceOrderId?: number }) {
    return this.assetsService.createAsset(req.user.sub, body);
  }

  @Patch(':id')
  updateAsset(@Request() req, @Param('id') id: string, @Body() body: { condition?: AssetCondition; quantity?: number; notes?: string }) {
    return this.assetsService.updateAsset(req.user.sub, Number(id), body);
  }

  @Delete(':id')
  deleteAsset(@Request() req, @Param('id') id: string) {
    return this.assetsService.deleteAsset(req.user.sub, Number(id));
  }
}
