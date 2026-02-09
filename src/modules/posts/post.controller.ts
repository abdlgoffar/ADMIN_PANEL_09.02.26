import {
  Controller,
  Post as HttpPost,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpPost('create')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    return this.postService.createWithImages(
      createPostDto,
      files,
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('get-all')
  async getAllPosts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.postService.findAll();
  }
}
