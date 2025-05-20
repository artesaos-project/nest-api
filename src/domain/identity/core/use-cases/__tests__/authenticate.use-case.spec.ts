import { AuthenticateUseCase } from '../authenticate.use-case';
import { JwtEncrypter } from '../../utils/encryption/jwt-encrypter';
import { User } from '../../entities/user.entity';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { FakeJwtGenerator } from '../../utils/encryption/__tests__/fake-jwt-generator';
import { FakeCryptography } from '../../utils/encryption/__tests__/fake-cryptography';
import { Cryptography } from '../../utils/encryption/cryptography';

let sut: AuthenticateUseCase;
let inMemoryRepository: InMemoryUsersRepository;
let fakeCryptography: Cryptography;
let fakeJwtGenerator: JwtEncrypter;

describe('Authenticate Use Case', () => {
  const validUser = User.create({
    name: 'John Doe',
    socialName: 'John',
    email: 'johndoe@example.com',
    cpf: '12345678900',
    birthDate: '1990-01-01',
    phone: '123456789',
    password: '123456-hashed',
  });

  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    fakeCryptography = new FakeCryptography();
    fakeJwtGenerator = new FakeJwtGenerator();

    sut = new AuthenticateUseCase(inMemoryRepository, fakeCryptography, fakeJwtGenerator);
  });

  it('should authenticate successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({
        accessToken: JSON.stringify({ sub: validUser.id, roles: ['USER'] }),
        roles: validUser.roles,
        userId: validUser.id,
        name: validUser.name,
        socialName: validUser.socialName,
      });
    }
  });

  it('should return error if user is not found', async () => {
    const result = await sut.execute({
      email: 'notfound@example.com',
      password: 'irrelevant',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });

  it('should return error if user is inactive', async () => {
    const inactiveUser = User.create({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456-hashed',
    });

    inactiveUser.deactivate();

    inMemoryRepository.save(inactiveUser);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: 'any-password',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });

  it('should return error if password does not match', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: 'wrong-password',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
  });
});
