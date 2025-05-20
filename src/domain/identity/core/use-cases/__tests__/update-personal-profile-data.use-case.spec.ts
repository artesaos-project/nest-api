import { User } from '../../entities/user.entity';
import { UserNotFoundError } from '../../errors/user-not-found.error';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { UpdatePersonalProfileDataUseCase } from '../update-personal-profile-data.use-case';

let sut: UpdatePersonalProfileDataUseCase;
let inMemoryRepository: InMemoryUsersRepository;

describe('update user profile data use case', () => {
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

    sut = new UpdatePersonalProfileDataUseCase(inMemoryRepository);
  });

  it('should update the name successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
      newName: 'Jane Doe',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: {
        name: 'Jane Doe',
        socialName: validUser.socialName,
        phone: validUser.phone,
      },
    });
  });

  it('should update the social name successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
      newSocialName: 'Jane Doe',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: {
        name: validUser.name,
        socialName: 'Jane Doe',
        phone: validUser.phone,
      },
    });
  });

  it('should update the phone number successfully', async () => {
    inMemoryRepository.save(validUser);

    const result = await sut.execute({
      userId: validUser.id,
      newPhone: '987654321',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      user: {
        name: validUser.name,
        socialName: validUser.socialName,
        phone: '987654321',
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
