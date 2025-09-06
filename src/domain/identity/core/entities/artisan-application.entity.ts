import { Entity } from '@/domain/_shared/core/entities/entity';

export enum ArtisanApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApplicationType {
  BE_ARTISAN = 'BE_ARTISAN',
  DISABLE_PROFILE = 'DISABLE_PROFILE',
}

export interface ArtisanApplicationProps {
  userId: string;
  type: ApplicationType;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  status: ArtisanApplicationStatus;
  rejectionReason?: string;
  reviewerId?: string;
}

type CreateArtisanApplicationProps = {
  userId: string;
  type?: ApplicationType;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  status?: ArtisanApplicationStatus;
  rejectionReason?: string;
  reviewerId?: string;
}

export class ArtisanApplication extends Entity<ArtisanApplicationProps> {
  static create(
    props: CreateArtisanApplicationProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ArtisanApplication {
    return new ArtisanApplication({
      ...props,
      status: props.status ?? ArtisanApplicationStatus.PENDING,
      type: props.type ?? ApplicationType.BE_ARTISAN,
      reviewerId: props.reviewerId ?? undefined,
    }, id, createdAt, updatedAt);
  }

  approve(reviewerId: string) {
    this.props.reviewerId = reviewerId;
    this.props.status = ArtisanApplicationStatus.APPROVED;

    this.touch();
  }

  reject(reason: string, reviewerId: string) {
    this.props.reviewerId = reviewerId;
    this.props.status = ArtisanApplicationStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.touch();
  }

  get userId() {
    return this.props.userId;
  }

  get type() {
    return this.props.type;
  }

  get rawMaterial() {
    return this.props.rawMaterial;
  }

  get technique() {
    return this.props.technique;
  }

  get finalityClassification() {
    return this.props.finalityClassification;
  }

  get sicab() {
    return this.props.sicab;
  }

  get sicabRegistrationDate() {
    return this.props.sicabRegistrationDate;
  }

  get sicabValidUntil() {
    return this.props.sicabValidUntil;
  }

  get status() {
    return this.props.status;
  }

  get rejectionReason() {
    return this.props.rejectionReason;
  }

  get reviewerId() {
    return this.props.reviewerId;
  }

  approveApplication(reviewerId: string) {
    this.props.reviewerId = reviewerId;
    this.props.status = ArtisanApplicationStatus.APPROVED;
    this.touch();
  }

  rejectApplication(reason: string, reviewerId: string) {
    this.props.reviewerId = reviewerId;
    this.props.status = ArtisanApplicationStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.touch();
  }
}
