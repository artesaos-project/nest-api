export class TargetNotFoundError extends Error {
  constructor(readonly target: 'product' | 'productRating' | 'user', id: string) {
    super(`${target} not found: ${id}`);
  }
}
