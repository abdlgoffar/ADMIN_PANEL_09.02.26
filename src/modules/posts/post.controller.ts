import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('posts')
export class PostController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('get-all')
  getPosts(): string {
    return 'Ini adalah daftar posts';
  }
}
