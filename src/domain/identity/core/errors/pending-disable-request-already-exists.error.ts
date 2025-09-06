export class PendingDisableRequestAlreadyExistsError extends Error {
  constructor(userId: string) {
    super(`A pending artisan application already exists for this user ${userId}`);
  }
}
