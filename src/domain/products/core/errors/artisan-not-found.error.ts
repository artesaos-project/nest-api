export class ArtisanNotFoundError extends Error {
  constructor() {
    super('Artisan not found');
    this.name = 'ArtisanNotFoundError';
  }
}
