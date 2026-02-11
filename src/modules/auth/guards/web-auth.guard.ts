/*
https://docs.nestjs.com/guards#guards
*/

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class WebAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.web_token;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException();
      }

      const isValid = await bcrypt.compare(token, user.hashedRefreshToken);

      if (!isValid) {
        throw new UnauthorizedException();
      }

      req.user = user;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
