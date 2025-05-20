import { Module } from '@nestjs/common';
import { Cryptography } from '@/domain/identity/core/utils/encryption/cryptography';
import { BcryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from '@/domain/identity/core/utils/encryption/jwt-encrypter';
import { JwtGenerator } from './jwt-generator';

@Module({
  providers: [
    { provide: Cryptography, useClass: BcryptHasher },
    { provide: JwtEncrypter, useClass: JwtGenerator },
  ],
  exports: [Cryptography, JwtEncrypter],
})
export class CryptographyModule {}
