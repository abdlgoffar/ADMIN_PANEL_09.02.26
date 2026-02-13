import { Controller, Get, Query, Render, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entity/user-role.enum';
import { Roles } from '../auth/guards/roles.decorator';
import { WebAuthGuard } from '../auth/guards/web-auth.guard';
import { UsersService } from './user.service';

@Controller('admin')
@UseGuards(WebAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminWebViewController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('layouts/admin')
  dashboard() {
    return {
      title: 'Dashboard',
      body: '../admin/main',
      active: 'dashboard',
    };
  }

  @Get('users')
  @Render('layouts/admin')
  async users(
    @Query('page') page = '1',
    @Query('limit') limit = '3',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('gender') gender?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const result = await this.usersService.findAllWithProfile({
      page: Number(page),
      limit: Number(limit),
      search,
      role,
      gender,
      sortBy,
      sortOrder,
    });

    return {
      title: 'Users Management',
      body: '../admin/users',
      active: 'users',
      users: result.data,
      pagination: result,
      query: { search, role, gender, sortBy, sortOrder },
    };
  }

  @Get('posts')
  @Render('layouts/admin')
  posts() {
    return {
      title: 'Postingan',
      body: '../admin/posts',
      active: 'posts',
    };
  }
}
