export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with ID "${id}" not found.`);
  }
}
