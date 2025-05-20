import { User } from '../../entities/user.entity';
import { UserNotFoundError } from '../../errors/user-not-found.error';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { DeactivateUserUseCase } from '../deactivate-user.use-case';

let sut: DeactivateUserUseCase;
let inMemoryRepository: InMemoryUsersRepository;

describe('deactivate user use case', () => {
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

    sut = new DeactivateUserUseCase(inMemoryRepository);
  });

  it('should deactivate a user successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: {
        id: validUser.id,
        name: validUser.name,
        cpf: validUser.cpf,
        roles: validUser.roles,
        isActive: false,
      },
    });
  });

  it('should return error if user is not found', async () => {
    const result = await sut.execute({
      userId: 'non-existing-user-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
