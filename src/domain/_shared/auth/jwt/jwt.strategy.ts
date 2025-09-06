import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';
import { Env } from '@/shared/env/env';
import { PrismaService } from '@/shared/prisma/prisma.service';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  roles: z.array(z.enum(['USER', 'ARTISAN', 'MODERATOR', 'ADMIN'])),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>, private readonly prisma: PrismaService) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.access_token]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: UserPayload) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!userExists) {
      throw new UnauthorizedException();
    }

    return tokenPayloadSchema.parse(payload);
  }
}
