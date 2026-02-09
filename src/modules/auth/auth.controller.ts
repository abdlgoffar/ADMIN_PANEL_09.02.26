/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { Response as ExpressResponse } from 'express';
import { Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({
    login: {
      limit: 5,
      ttl: 60,
    },
  })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokens = await this.authService.login(dto.username, dto.password);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('refresh_token', {
      path: '/auth/refresh',
    });

    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
    try {
      const tokens = await this.authService.refreshTokens(
        req.user.sub,
        req.cookies.refresh_token,
      );

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
      });

      return { accessToken: tokens.accessToken };
    } catch (e) {
      res.clearCookie('refresh_token', { path: '/auth/refresh' });
      throw e;
    }
  }
}
