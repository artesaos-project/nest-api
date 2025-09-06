import { Entity } from '@/domain/_shared/core/entities/entity';

export interface ProductPhotoProps {
  productId: string;
  attachmentId: string;
}

export class ProductPhoto extends Entity<ProductPhotoProps> {
  static create(
    props: ProductPhotoProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ProductPhoto {
    const productPhoto = new ProductPhoto(props, id, createdAt, updatedAt);

    return productPhoto;
  }

  get productId() {
    return this.props.productId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }
}
