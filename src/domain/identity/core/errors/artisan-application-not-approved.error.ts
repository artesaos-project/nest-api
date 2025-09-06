export class ArtisanApplicationNotApprovedError extends Error {
  constructor() {
    super('Cannot confirm disable: application is not approved.');
  }
}
