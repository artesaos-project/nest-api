export class ReviewImageOwnershipError extends Error {
  constructor() {
    super('One or more images are not owned by the current user.');
  }
}
