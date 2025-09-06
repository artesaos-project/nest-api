export class PropertyMissingError extends Error {
  constructor(property: string) {
    super(`Property "${property}" is missing.`);
    this.name = 'PropertyMissingError';
  }
}
