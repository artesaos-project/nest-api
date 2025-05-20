export class NoUsersFoundError extends Error {
  constructor() {
    super('No users found.');
    this.name = 'NoUsersFoundError';
  }
}
