import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface LogoutInput {
  sessionId: string;
  userId: string;
}

@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(input: LogoutInput): Promise<void> {
    const { sessionId, userId } = input;

    try {
      await this.prisma.session.updateMany({
        where: {
          id: sessionId,
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });

      this.logger.log(`User logged out successfully: ${userId}, session: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Logout error for user ${userId}:`, error);
      throw error;
    }
  }
}
