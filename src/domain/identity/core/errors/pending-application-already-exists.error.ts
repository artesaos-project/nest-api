export class PendingApplicationAlreadyExistsError extends Error {
  constructor() {
    super('A pending artisan application already exists for this user.');
  }
}
