export class OperationNotAllowedError extends Error {
  constructor(message = 'Operation not allowed') {
    super(message);
    this.name = 'OperationNotAllowedError';
  }
}
