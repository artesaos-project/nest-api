import { User } from '../../entities/user.entity';
import { NoUsersFoundError } from '../../errors/no-users-found.error';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { GetAllUsersUseCase } from '../gel-all-users.use-case';

let sut: GetAllUsersUseCase;
let inMemoryRepository: InMemoryUsersRepository;

describe('get user by id use case', () => {
  const user = User.create({
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

    sut = new GetAllUsersUseCase(inMemoryRepository);
  });

  it('should list all users successfully', async () => {
    inMemoryRepository.save(user);

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      users: [{
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        roles: user.roles,
        socialName: user.socialName,
        birthDate: user.birthDate,
        phone: user.phone,
        isActive: user.isActive,
      }],
    });
  });

  it('should return error if no users was found', async () => {
    const result = await sut.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NoUsersFoundError);
  });
});
