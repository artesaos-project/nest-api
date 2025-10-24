import { $Enums } from '@prisma/client';

export type ReportReason = $Enums.ReportReason;

export interface AuthenticatedUser {
  id: string;
  roles: $Enums.Roles[];
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

export interface PaginatedQuery {
  take?: number;
  skip?: number;
}
