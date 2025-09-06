import { Entity } from '../../../core/entities/entity';

export interface AttachmentProps {
  mimeType: string;
  sizeInBytes: number;
}

export class Attachment extends Entity<AttachmentProps> {
  private constructor(props: AttachmentProps, id?: string, createdAt?: Date, updatedAt?: Date) {
    super(props, id, createdAt, updatedAt);
  }

  static create(
    props: AttachmentProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Attachment {
    return new Attachment({
      ...props,
    }, id, createdAt, updatedAt);
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get sizeInBytes(): number {
    return this.props.sizeInBytes;
  }
}
