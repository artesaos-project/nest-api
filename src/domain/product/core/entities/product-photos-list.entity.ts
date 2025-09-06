import { WatchedList } from '@/domain/_shared/core/entities/watched-list.entity';
import { ProductPhoto } from './product-photo.entity';

export class ProductPhotosList extends WatchedList<ProductPhoto> {
  compareItems(a: ProductPhoto, b: ProductPhoto): boolean {
    return a.attachmentId === b.attachmentId;
  }
}
