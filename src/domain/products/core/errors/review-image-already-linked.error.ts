export class ReviewImageAlreadyLinkedError extends Error {
  constructor() {
    super('One or more images are already linked to another review.');
  }
}
