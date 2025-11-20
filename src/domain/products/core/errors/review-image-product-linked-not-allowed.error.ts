export class ReviewImageProductLinkedNotAllowedError extends Error {
  constructor() {
    super('Images already linked to a product cannot be attached to a review.');
  }
}
