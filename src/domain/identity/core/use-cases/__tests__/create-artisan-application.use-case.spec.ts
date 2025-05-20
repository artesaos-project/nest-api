import { ArtisanApplication, ArtisanApplicationStatus } from '../../entities/artisan-application.entity';
import { User } from '../../entities/user.entity';
import { PendingApplicationAlreadyExistsError } from '../../errors/pending-application-already-exists.error';
import { UserNotFoundError } from '../../errors/user-not-found.error';
import { InMemoryArtisanApplicationsRepository } from '../../repositories/__tests__/in-memory-artisan-applications.repository';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { ArtisanApplicationsRepository } from '../../repositories/artisan-applications.repository';
import { UsersRepository } from '../../repositories/users.repository';
import { CreateArtisanApplicationUseCase } from '../create-artisan-application.use-case';

let sut: CreateArtisanApplicationUseCase;
let inMemoryArtisanApplicationsRepository: ArtisanApplicationsRepository;
let inMemoryUsersRepository: UsersRepository;

describe('create artisan application use case', () => {
  const validUser = {
    id: 'user-id',
    name: 'John Doe',
    socialName: 'John',
    email: 'johndoe@example.com',
    cpf: '12345678900',
    birthDate: '1990-01-01',
    phone: '123456789',
    password: '123456-hashed',
  };

  const validArtisanApplication = {
    userId: validUser.id,
    rawMaterial: 'Wood',
    technique: 'Wood carving',
    finalityClassification: 'Artistic',
    sicab: '123456789',
    sicabRegistrationDate: new Date('2023-05-10'),
    sicabValidUntil: new Date('2029-05-09'),
  };

  beforeEach(() => {
    inMemoryArtisanApplicationsRepository = new InMemoryArtisanApplicationsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    sut = new CreateArtisanApplicationUseCase(
      inMemoryArtisanApplicationsRepository,
      inMemoryUsersRepository,
    );
  });

  it('Should be able to create a new artisan application', async () => {
    const user = User.create({ ...validUser }, validUser.id);

    inMemoryUsersRepository.save(user);

    const result = await sut.execute({
      userId: user.id,
      rawMaterial: 'Wood',
      technique: 'Wood carving',
      finalityClassification: 'Artistic',
      sicab: '123456789',
      sicabRegistrationDate: new Date('2023-05-10'),
      sicabValidUntil: new Date('2029-05-09'),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toBeInstanceOf(ArtisanApplication);
  });

  it('should return an error if the user does not exist', async () => {
    const result = await sut.execute(validArtisanApplication);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should return an error if the user already has a pending application', async () => {
    const user = User.create({ ...validUser }, validUser.id);

    inMemoryUsersRepository.save(user);

    const existingApplication = ArtisanApplication.create({
      userId: user.id,
      rawMaterial: 'Wood',
      technique: 'Wood carving',
      finalityClassification: 'Artistic',
      sicab: '123456789',
      sicabRegistrationDate: new Date('2023-05-10'),
      sicabValidUntil: new Date('2029-05-09'),
      status: ArtisanApplicationStatus.PENDING,
    });

    inMemoryArtisanApplicationsRepository.save(existingApplication);

    const result = await sut.execute(validArtisanApplication);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PendingApplicationAlreadyExistsError);
  });
});
