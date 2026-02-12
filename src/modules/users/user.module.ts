import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entity/user.entity';
import { UsersService } from './user.service';
import { UserController } from './user.controller';
import { UserProfile } from './entity/user-profile.entity';
import { PostService } from '../posts/post.service';
import { PostModule } from '../posts/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile]), PostModule],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
