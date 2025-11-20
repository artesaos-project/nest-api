import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { RequestStatus, Roles } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

export interface AuthenticateInput {
  email: string;
  password: string;
  ipHost: string;
  userAgent: string;
}

export interface AuthenticateOutput {
  user: {
    id: string;
    name: string;
    socialName?: string;
    email: string;
    postnedApplication?: boolean;
    applicationStatus?: RequestStatus | 'NOT_ARTISAN' | 'NOT_FINISHED';
    applicationId?: string;
    artisanUsername?: string;
    roles: Roles[];
    avatar?: string;
  };
  session: {
    id: string;
    accessToken: string;
    expiresAt: Date;
  };
}

type Output = Either<InvalidCredentialsError, AuthenticateOutput>;

@Injectable()
export class AuthenticateUseCase {
  private readonly logger = new Logger(AuthenticateUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3AttachmentsStorage: S3StorageService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: AuthenticateInput): Promise<Output> {
    const {
      email, password, ipHost, userAgent,
    } = input;

    try {
      const user = await this.usersRepository.findByEmail(email);

      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${email}`);
        return left(new InvalidCredentialsError());
      }

      if (user.isDisabled) {
        this.logger.warn(`Login attempt with disabled user: ${email}`);
        return left(new InvalidCredentialsError());
      }

      const passwordMatches = await compare(password, user.password);

      if (!passwordMatches) {
        this.logger.warn(`Invalid password attempt for user: ${email}`);
        return left(new InvalidCredentialsError());
      }

      await this.cleanupExpiredSessions(user.id);

      const result = await this.prisma.$transaction(async (tx) => {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

        const session = await tx.session.create({
          data: {
            userId: user.id,
            expiresAt,
            ipHost,
            userAgent,
            lastUsedAt: new Date(),
          },
        });

        return { user, session };
      });

      const application = await this.prisma.artisanApplication.findFirst({
        where: {
          userId: user.id,
        },
      });

      const isArtisan = user.roles.includes(Roles.ARTISAN);

      let applicationStatus: AuthenticateOutput['user']['applicationStatus'];

      if (application && application?.formStatus !== 'SUBMITTED') {
        applicationStatus = 'NOT_FINISHED';
      } else if (application?.formStatus === 'SUBMITTED') {
        applicationStatus = application.status as RequestStatus;
      } else {
        applicationStatus = 'NOT_ARTISAN';
      }

      let artisanUsername: { artisanUserName: string } | null = null;

      if (isArtisan) {
        artisanUsername = await this.prisma.artisanProfile.findUnique({
          where: { userId: user.id },
          select: { artisanUserName: true },
        });
      }

      const tokenPayload = {
        sub: result.user.id,
        jti: result.session.id,
        email: result.user.email,
        name: result.user.name,
        roles: result.user.roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(result.session.expiresAt.getTime() / 1000),
      };

      const accessToken = await this.jwtService.signAsync(tokenPayload);

      this.logger.log(`User authenticated successfully: ${result.user.id}`);

      const avatar = await this.generateAvatarUrl(result.user.avatar);

      return right({
        user: {
          id: result.user.id,
          name: result.user.name,
          socialName: result.user.socialName ?? undefined,
          email: result.user.email,
          artisanUsername: artisanUsername?.artisanUserName,
          applicationStatus,
          applicationId: application?.id ?? undefined,
          avatar: avatar ?? undefined,
          roles: result.user.roles,
        },
        session: {
          id: result.session.id,
          accessToken,
          expiresAt: result.session.expiresAt,
        },
      });
    } catch (error) {
      this.logger.error(`Authentication error for ${email}:`, error);
      return left(new InvalidCredentialsError());
    }
  }

  private async cleanupExpiredSessions(userId: string): Promise<void> {
    try {
      await this.prisma.session.updateMany({
        where: {
          userId,
          expiresAt: {
            lt: new Date(),
          },
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions:', error);
    }
  }

  private async generateAvatarUrl(avatarId: string | null): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      const url = await this.s3AttachmentsStorage.getUrlByFileName(avatarId);
      this.logger.debug(`Generated avatar URL for attachment: ${avatarId}`);
      return url;
    } catch (urlError) {
      this.logger.warn(`Failed to generate avatar URL for attachment ${avatarId}:`, urlError);
      return null;
    }
  }
}
