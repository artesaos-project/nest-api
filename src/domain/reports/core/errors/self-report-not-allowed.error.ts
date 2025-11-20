export class SelfReportNotAllowedError extends Error {
  constructor() {
    super('You cannot report your own content');
  }
}
