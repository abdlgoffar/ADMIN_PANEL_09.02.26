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
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { UpdatePostDto } from './dto/upadate-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpPost()
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
  @Roles(UserRole.USER)
  @Get('my')
  async getAllMyPosts(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.postService.findAllMyPost(
      req.user.sub,
      Number(limit) || 10,
      Number(offset) || 0,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('other')
  async getAllOtherPosts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.postService.findAllOtherPost();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postService.updateParagraph(
      Number(id),
      req.user.sub,
      req.user.role,
      updatePostDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.postService.softDelete(Number(id), req.user.sub, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('pagination')
  async getAllPaginate(@Query() query: QueryPostDto) {
    return this.postService.findAllPaginated(query);
  }
}
