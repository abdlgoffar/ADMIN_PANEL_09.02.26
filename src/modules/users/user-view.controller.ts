/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './user-role.enum';
import { Roles } from '../auth/guards/roles.decorator';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';

@Controller('user')
@UseGuards(WebAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class UserViewController {
  @Get()
  @Render('layouts/user')
  userDashboard() {
    return {
      title: 'User Dashboard',
      body: 'user/main',
    };
  }
}
