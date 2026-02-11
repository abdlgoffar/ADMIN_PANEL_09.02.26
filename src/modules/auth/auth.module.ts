/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthWebController } from './auth-web.controller';
import { AuthWebViewController } from './auth-web-view.controller';

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule, ConfigModule],
  controllers: [AuthController, AuthWebController, AuthWebViewController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
