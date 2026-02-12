import { UserWebController } from './modules/users/user-web.controller';
import { AdminWebViewController } from './modules/users/admin-web-view.controller';
import { UserWebViewController } from './modules/users/user-web-view.controller';
import { PostModule } from './modules/posts/post.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import { PostController } from './modules/posts/post.controller';
import { AuthWebViewController } from './modules/auth/auth-web-view.controller';
import { UserController } from './modules/users/user.controller';

@Module({
  imports: [
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'admin_panel_db',
      entities: [__dirname + '/modules/**/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*.js'],
      synchronize: true,
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60,
          limit: 20,
        },
        {
          name: 'login',
          ttl: 60,
          limit: 5,
        },
      ],
    }),

    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],

  controllers: [
    UserWebController,
    AuthWebViewController,
    AdminWebViewController,
    UserWebViewController,
    PostController,
    UserController,
  ],
})
export class AppModule {}
