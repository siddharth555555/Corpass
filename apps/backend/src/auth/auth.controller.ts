import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: Record<string, string>) {
    return this.authService.login(body.identifier, body.password, body.role);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: any) {
    return this.authService.updateProfile(req.user.sub, body);
  }
}
