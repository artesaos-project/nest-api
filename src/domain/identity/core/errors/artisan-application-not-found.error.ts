export class ArtisanApplicationNotFoundError extends Error {
  constructor(artisanApplicationId: string) {
    super(`Artisan application with ID "${artisanApplicationId}" not found.`);
  }
}
