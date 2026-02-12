/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entity/user-role.enum';
import { Roles } from '../auth/guards/roles.decorator';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';

import type { Request } from 'express';

import { UsersService } from './user.service';

@Controller('user')
@UseGuards(WebAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class UserWebViewController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('layouts/user')
  async userDashboard(@Req() req: Request) {
    const userId = (req as any).user.id;

    const user = await this.usersService.findUserWithProfile(userId);

    return {
      title: 'User Dashboard',
      body: 'user/main',
      user,
      profile: user?.profile,
    };
  }
}
