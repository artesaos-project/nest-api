import { Entity } from '@/domain/_shared/core/entities/entity';

export interface ProductLikeProps {
  productId: string;
  userId: string;
}

export class ProductLike extends Entity<ProductLikeProps> {
  static create(
    props: ProductLikeProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ProductLike {
    const productLike = new ProductLike(props, id, createdAt, updatedAt);
    return productLike;
  }

  get productId() {
    return this.props.productId;
  }

  get userId() {
    return this.props.userId;
  }
}
