export class ReportNotFoundError extends Error {
  constructor() {
    super('Report not found');
  }
}
