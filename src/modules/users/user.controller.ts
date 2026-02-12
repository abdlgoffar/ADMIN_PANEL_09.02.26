import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  NotFoundException,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from './entity/user-role.enum';

import { UsersService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Get('profile')
  async getMyProfile(@Request() req) {
    const user = await this.usersService.findUserWithProfile(req.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.profile;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @Post('update/profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
    }),
  )
  async updateMyProfile(
    @Request() req,
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
    file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;

    if (file) {
      const metadata = await sharp(file.buffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Invalid image file');
      }

      if (metadata.width !== metadata.height) {
        throw new BadRequestException(
          'Profile photo must have 1:1 aspect ratio',
        );
      }

      file.buffer = await sharp(file.buffer)
        .resize(500, 500)
        .jpeg({ quality: 80 })
        .toBuffer();

      file.mimetype = 'image/jpeg';
    }

    const updatedProfile = await this.usersService.updateUserProfile(
      userId,
      dto,
      file,
    );

    return {
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }
}
