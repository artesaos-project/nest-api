export class UserAlreadyExistsError extends Error {
  constructor(identifier: string) {
    super(`User with same ${identifier} already exists.`);
    this.name = 'UserAlreadyExistsError';
  }
}
