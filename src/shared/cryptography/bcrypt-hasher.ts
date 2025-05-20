import { hash, compare } from 'bcryptjs';
import { Cryptography } from '@/domain/identity/core/utils/encryption/cryptography';

export class BcryptHasher implements Cryptography {
  private HASH_SALT_LENGTH = 10;

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  async compare(plain: string, hashedValue: string): Promise<boolean> {
    return compare(plain, hashedValue);
  }
}
