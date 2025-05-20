import { User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;

  abstract findByCpf(cpf: string): Promise<User | null>;

  abstract findById(id: string): Promise<User | null>;

  abstract listAll(): Promise<User[] | []>;

  abstract save(user: User): Promise<void>;
}
