import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req?.cookies?.refresh_token) {
          throw new UnauthorizedException(['No refresh token']);
        }
        return req.cookies.refresh_token;
      },
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    return {
      sub: payload.sub,
    };
  }
}
