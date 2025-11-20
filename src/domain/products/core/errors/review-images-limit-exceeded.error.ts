export class ReviewImagesLimitExceededError extends Error {
  constructor(limit = 5) {
    super(`You can attach up to ${limit} images.`);
  }
}
