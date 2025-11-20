export class UnauthorizedProductAccessError extends Error {
  constructor() {
    super('Você não tem permissão para acessar este produto.');
    this.name = 'UnauthorizedProductAccessError';
  }
}
