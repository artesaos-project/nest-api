import { Entity } from '@/domain/_shared/core/entities/entity';
import { ProductPhotosList } from './product-photos-list.entity';

export interface ProductProps {
  artisanId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: number;
  stock: number;
  likesCount: number;
  photos?: ProductPhotosList;
  coverPhotoId?: string;
  averageRating?: number;
  isActive?: boolean;
}

export class Product extends Entity<ProductProps> {
  static create(
    props: ProductProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Product {
    const product = new Product({
      ...props,
      isActive: props.isActive ?? true,
      likesCount: props.likesCount ?? 0,
      averageRating: props.averageRating ?? 0,
    }, id, createdAt, updatedAt);

    return product;
  }

  get artisanId() {
    return this.props.artisanId;
  }

  get title() {
    return this.props.title;
  }

  set title(value: string) {
    this.touch();
    this.props.title = value;
  }

  get description() {
    return this.props.description;
  }

  set description(value: string) {
    this.touch();
    this.props.description = value;
  }

  get priceInCents() {
    return this.props.priceInCents;
  }

  set priceInCents(value: number) {
    this.touch();
    this.props.priceInCents = value;
  }

  get categoryId() {
    return this.props.categoryId;
  }

  set categoryId(value: number) {
    this.touch();
    this.props.categoryId = value;
  }

  get stock() {
    return this.props.stock;
  }

  set stock(value: number) {
    this.touch();
    this.props.stock = value;
  }

  get likesCount() {
    return this.props.likesCount;
  }

  get photos(): ProductPhotosList | undefined {
    return this.props.photos;
  }

  set photos(value: ProductPhotosList) {
    this.touch();
    this.props.photos = value;
  }

  get coverPhotoId(): string | undefined {
    return this.props.coverPhotoId;
  }

  set coverPhotoId(value: string) {
    this.touch();
    this.props.coverPhotoId = value;
  }

  get averageRating() {
    return this.props.averageRating;
  }

  deactivate() {
    this.touch();
    this.props.isActive = false;
  }

  activate() {
    this.touch();
    this.props.isActive = true;
  }
}
