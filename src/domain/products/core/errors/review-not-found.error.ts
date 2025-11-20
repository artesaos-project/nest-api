export class ReviewNotFoundError extends Error {
  constructor() {
    super('Rating not found for this user/product');
    this.name = 'ReviewNotFoundError';
  }
}
