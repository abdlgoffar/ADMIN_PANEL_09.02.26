import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';

import { User } from '../users/user.entity';
import { Post } from './post.entity';
import { PostImage } from './post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage, User])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
