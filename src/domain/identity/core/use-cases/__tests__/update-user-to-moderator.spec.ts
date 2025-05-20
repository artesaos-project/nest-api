import { User, UserRole } from '../../entities/user.entity';
import { PropertyAlreadyExists } from '../../errors/property-already-exists.error';
import { UserNotFoundError } from '../../errors/user-not-found.error';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { AddModeratorRoleUseCase } from '../add-moderator-role.use-case';

let sut: AddModeratorRoleUseCase;
let inMemoryRepository: InMemoryUsersRepository;

describe('update user to moderator use case', () => {
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

    sut = new AddModeratorRoleUseCase(inMemoryRepository);
  });

  it('should update user to moderator successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({
        userId: validUser.id,
        roles: validUser.roles,
      });
    }
  });

  it('should return error if user is not found', async () => {
    const result = await sut.execute({
      userId: validUser.id,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return error if user is already a moderator', async () => {
    validUser.roles.push(UserRole.MODERATOR);

    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PropertyAlreadyExists);
  });
});
