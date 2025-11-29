/* eslint-disable lines-between-class-members */
import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository, AdminListedUser } from '@/domain/repositories/users.repository';

export interface ListAdminUsersInput {
  page: number;
  limit: number;
}

export interface ListAdminUsersOutput {
  users: AdminListedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type Output = Either<Error, ListAdminUsersOutput>;

@Injectable()
export class ListAdminUsersUseCase {
  private readonly logger = new Logger(ListAdminUsersUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: ListAdminUsersInput): Promise<Output> {
    const { page, limit } = input;

    const currentPage = Number(page) > 0 ? Number(page) : 1;
    let currentLimit = Number(limit) > 0 ? Number(limit) : 20;

    if (currentLimit > 50) currentLimit = 50;

    const skip = (currentPage - 1) * currentLimit;

    this.logger.log(
      `Listing admin users: page=${currentPage}, limit=${currentLimit}`,
    );

    try {
      const [users, total] = await Promise.all([
        this.usersRepository.findManyAdminUsers({
          skip,
          take: currentLimit,
        }),
        this.usersRepository.countAdminUsers(),
      ]);

      const totalPages = Math.ceil(total / currentLimit);

      this.logger.log(
        `Listed users successfully: total=${total}, pages=${totalPages}`,
      );

      return right({
        users,
        pagination: {
          page: currentPage,
          limit: currentLimit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      this.logger.error('Error while listing admin users', error.stack);
      return left(error);
    }
  }
}
