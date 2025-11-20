import { NotFoundException } from '@nestjs/common/exceptions';

export class ProductNotFoundError extends NotFoundException {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`);
  }
}
