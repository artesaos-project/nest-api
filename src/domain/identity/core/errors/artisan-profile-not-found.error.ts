export class ArtisanProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`Artisan profile not found for user ${userId}`);
  }
}
