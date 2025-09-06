import { Entity } from '@/domain/_shared/core/entities/entity';

export interface ProductRatingProps {
  productId: string;
  userId: string;
  comment?: string;
  rating: number;
}

export class ProductRating extends Entity<ProductRatingProps> {
  static create(
    props: ProductRatingProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): ProductRating {
    const productRating = new ProductRating(props, id, createdAt, updatedAt);
    return productRating;
  }

  get productId() {
    return this.props.productId;
  }

  get userId() {
    return this.props.userId;
  }

  get content(): string | undefined {
    return this.props.comment;
  }

  set content(value: string) {
    this.touch();
    this.props.comment = value;
  }

  get rating() {
    return this.props.rating;
  }

  set rating(value: number) {
    this.touch();
    this.props.rating = value;
  }
}
