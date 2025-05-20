export abstract class JwtEncrypter {
  abstract encrypt(payload: Record<string, unknown>): Promise<string>;
}
