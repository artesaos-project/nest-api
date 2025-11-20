export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super('You have already rated this product');
    this.name = 'ReviewAlreadyExistsError';
  }
}
