export class ArtisanApplicationAlreadyModeratedError extends Error {
  constructor(applicationId: string) {
    super(`Artisan application with ID "${applicationId}" has already been moderated.`);
    this.name = 'ArtisanApplicationAlreadyModeratedError';
  }
}
