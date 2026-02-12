import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';

import { User } from '../users/entity/user.entity';
import { PostImage } from './entity/post-image.entity';
import { Post } from './entity/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage, User])],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
