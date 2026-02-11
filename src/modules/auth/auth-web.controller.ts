/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('web-auth')
export class AuthWebController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(dto.username, dto.password);

    res.cookie('web_token', tokens.refreshToken, {
      httpOnly: true,
      path: '/',
    });

    const payload = this.authService.decodeAccessToken(tokens.accessToken);

    if (payload.role.toLowerCase() === 'admin') {
      return res.redirect('/admin');
    }

    return res.redirect('/user');
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('web_token', { path: '/' });
    return res.redirect('/');
  }
}
