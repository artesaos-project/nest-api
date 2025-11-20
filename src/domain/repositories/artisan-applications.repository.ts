import { Injectable } from '@nestjs/common';
import {
  ArtisanApplication, FormStatus, ApplicationType, RequestStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateArtisanApplicationData {
  userId: string;
  formStatus: FormStatus;
  type: ApplicationType;
  rawMaterial: string[];
  technique: string[];
  finalityClassification: string[];
  comercialName?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  bio?: string;
  sicab?: string;
  sicabRegistrationDate?: Date;
  sicabValidUntil?: Date;
}

export interface UpdateArtisanApplicationData {
  formStatus?: FormStatus;
  comercialName: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  rawMaterial?: string[];
  technique?: string[];
  finalityClassification?: string[];
  bio?: string;
  sicab?: string;
  sicabRegistrationDate?: Date;
  sicabValidUntil?: Date;
  updatedAt?: Date;
}

export interface ModerateApplicationData {
  status: RequestStatus;
  reviewerId: string;
  rejectionReason?: string;
}

export interface FindAllApplicationsFilters {
  type?: ApplicationType;
  status?: RequestStatus;
  formStatus?: FormStatus;
  page?: number;
  limit?: number;
  search?: string;
}

export interface FindAllApplicationsResult {
  applications: (ArtisanApplication & {
    _count: {
      Attachment: number;
    };
  })[];
  total: number;
}

@Injectable()
export class ArtisanApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateArtisanApplicationData): Promise<ArtisanApplication> {
    return this.prisma.artisanApplication.create({
      data,
      include: {
        userRequesting: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<ArtisanApplication | null> {
    return this.prisma.artisanApplication.findUnique({
      where: { id },
      include: {
        userRequesting: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Attachment: true,
      },
    });
  }

  async findPendingByUserId(userId: string): Promise<ArtisanApplication | null> {
    return this.prisma.artisanApplication.findFirst({
      where: {
        userId,
        status: RequestStatus.PENDING,
      },
    });
  }

  async findByUserId(userId: string): Promise<ArtisanApplication[]> {
    return this.prisma.artisanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        Attachment: true,
      },
    });
  }

  async findPostponedByUserId(userId: string): Promise<ArtisanApplication | null> {
    return this.prisma.artisanApplication.findFirst({
      where: {
        userId,
        formStatus: FormStatus.POSTPONED,
        status: RequestStatus.PENDING,
      },
    });
  }

  async update(id: string, data: UpdateArtisanApplicationData): Promise<ArtisanApplication> {
    return this.prisma.artisanApplication.update({
      where: { id },
      data,
      include: {
        userRequesting: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async moderateApplication(
    id: string,
    data: ModerateApplicationData,
  ): Promise<ArtisanApplication> {
    return this.prisma.artisanApplication.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        userRequesting: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findPendingApplications(): Promise<ArtisanApplication[]> {
    return this.prisma.artisanApplication.findMany({
      where: {
        status: RequestStatus.PENDING,
        formStatus: FormStatus.SUBMITTED,
      },
      include: {
        userRequesting: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Attachment: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAllWithFilters(
    filters: FindAllApplicationsFilters,
  ): Promise<FindAllApplicationsResult> {
    const {
      type,
      status,
      formStatus,
      page = 1,
      limit = 20,
      search,
    } = filters;

    const where: Prisma.ArtisanApplicationWhereInput = {
      ...(type && { type }),
      ...(status && { status }),
      ...(formStatus && { formStatus }),
      ...(search && {
        OR: [
          {
            userRequesting: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            userRequesting: {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            sicab: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [applications, total] = await Promise.all([
      this.prisma.artisanApplication.findMany({
        where,
        include: {
          _count: {
            select: {
              Attachment: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.artisanApplication.count({ where }),
    ]);

    return { applications, total };
  }

  async deleteByUserId(userId: string) {
    await this.prisma.artisanApplication.deleteMany({
      where: {
        userId,
      },
    });
  }
}
