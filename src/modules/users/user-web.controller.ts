import {
  Controller,
  UseGuards,
  Req,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  Post,
  Res,
  BadRequestException,
  Param,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request, Response } from 'express';

import { WebAuthGuard } from '../auth/guards/web-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entity/user-role.enum';
import { UsersService } from './user.service';
import { Roles } from '../auth/guards/roles.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

import sharp from 'sharp';
import { PostService } from '../posts/post.service';

@Controller('web-user')
@UseGuards(WebAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class UserWebController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postService: PostService,
  ) {}
  @Post('update/profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
    }),
  )
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateUserProfileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const userId = (req as any).user.id;

    if (file) {
      const metadata = await sharp(file.buffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('File gambar tidak valid');
      }

      if (metadata.width !== metadata.height) {
        throw new BadRequestException(
          'Foto profile harus memiliki rasio 1:1 (square)',
        );
      }
    }

    await this.usersService.updateUserProfile(userId, dto, file);

    return res.redirect('/user');
  }

  @Post('delete-post/:id')
  async deletePost(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).user.id;

    await this.postService.removeWeb(id, userId);

    return res.redirect('/user');
  }
}
