import { JwtEncrypter } from '../jwt-encrypter';

export class FakeJwtGenerator implements JwtEncrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload);
  }
}
