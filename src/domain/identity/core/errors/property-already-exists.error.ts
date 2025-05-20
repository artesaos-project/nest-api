export class PropertyAlreadyExists extends Error {
  constructor(propertyIdentifier: string) {
    super(`The property ${propertyIdentifier} already exists for this user.`);
  }
}
