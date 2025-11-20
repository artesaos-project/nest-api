export class ReviewImageRaceConflictError extends Error {
  constructor() {
    super('Some images could not be attached (ownership, linkage or concurrency issue).');
  }
}
