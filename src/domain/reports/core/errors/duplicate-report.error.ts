export class DuplicateReportError extends Error {
  constructor() {
    super('Duplicate report for this target by the same user');
  }
}
