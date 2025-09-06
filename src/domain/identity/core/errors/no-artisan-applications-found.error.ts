export class NoArtisanApplicationsFoundError extends Error {
  constructor() {
    super('No artisan applications found.');
    this.name = 'NoArtisanApplicationsFoundError';
  }
}
