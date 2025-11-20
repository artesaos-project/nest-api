export class InvalidRatingError extends Error {
  constructor() {
    super('The grade must be between 1 and 5');
    this.name = 'InvalidRatingError';
  }
}
