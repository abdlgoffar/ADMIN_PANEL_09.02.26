/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entity/user-role.enum';
import { Roles } from '../auth/guards/roles.decorator';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';

@Controller('admin')
@UseGuards(WebAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminWebViewController {
  @Get()
  @Render('layouts/admin')
  adminDashboard() {
    return {
      title: 'Admin Dashboard',
      body: 'admin/main',
    };
  }
}
