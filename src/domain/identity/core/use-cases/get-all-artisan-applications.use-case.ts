import { Injectable, Logger } from '@nestjs/common';
import { ApplicationType, RequestStatus, FormStatus } from '@prisma/client';
import { Either, right, left } from '@/domain/_shared/utils/either';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';

export interface GetAllArtisanApplicationsInput {
  type?: ApplicationType;
  status?: RequestStatus;
  formStatus?: FormStatus;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ArtisanApplicationWithUserDetails {
  id: string;
  type: ApplicationType;
  artisanName: string;
  email: string;
  rawMaterial: string[];
  technique: string[];
  sicab: string | null;
  formStatus: FormStatus
  status: RequestStatus;
  createdAt: Date;
}

export interface GetAllArtisanApplicationsOutput {
  artisanApplications: ArtisanApplicationWithUserDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type Output = Either<
  Error,
  GetAllArtisanApplicationsOutput
>;

@Injectable()
export class GetAllArtisanApplicationsUseCase {
  private readonly logger = new Logger(GetAllArtisanApplicationsUseCase.name);

  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(input: GetAllArtisanApplicationsInput = {}): Promise<Output> {
    const {
      type,
      status,
      formStatus,
      page = 1,
      limit = 20,
      search,
    } = input;

    try {
      this.logger.debug('Fetching artisan applications with filters:', {
        type, status, formStatus, page, limit, search,
      });

      const { applications, total } = await this.artisanApplicationsRepository.findAllWithFilters({
        type,
        status,
        formStatus,
        page,
        limit,
        search,
      });

      if (applications.length === 0) {
        this.logger.debug('No artisan applications found');
        return right({
          artisanApplications: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const userIds = applications.map((app) => app.userId);
      const users = await this.usersRepository.findManyByIds(userIds);

      const usersMap = new Map(users.map((user) => [user.id, user]));

      const applicationsWithUserDetails = applications.map((app) => {
        const user = usersMap.get(app.userId);

        if (!user) {
          this.logger.warn(`User not found for application ${app.id}: ${app.userId}`);
        }

        return {
          id: app.id,
          type: app.type,
          artisanName: user?.name || 'Usuário não encontrado',
          email: user?.email || 'Email não disponível',
          rawMaterial: app.rawMaterial,
          technique: app.technique,
          sicab: app.sicab,
          formStatus: app.formStatus,
          status: app.status,
          createdAt: app.createdAt,
        } as ArtisanApplicationWithUserDetails;
      });

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Retrieved ${applications.length} artisan applications (page ${page}/${totalPages})`);

      return right({
        artisanApplications: applicationsWithUserDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      this.logger.error('Error fetching artisan applications:', error);
      return left(new Error());
    }
  }
}
