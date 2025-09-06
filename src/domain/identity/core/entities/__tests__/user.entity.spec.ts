import { User, UserRole } from '../user.entity';

describe('User Entity', () => {
  const userProps = {
    name: 'John Doe',
    email: 'john@example.com',
    cpf: '12345678900',
    birthDate: '1990-01-01',
    phone: '1234567890',
    password: '123456',
    role: UserRole.USER,
  };

  it('should be defined as User instance', () => {
    const user = User.create(userProps);

    expect(user).toBeDefined();
    expect(user).toBeInstanceOf(User);
  });

  test('get methods', () => {
    const user = User.create(userProps);

    expect(user.name).toBe('John Doe');
    expect(user.socialName).toBeUndefined();
    expect(user.email).toBe('john@example.com');
    expect(user.cpf).toBe('12345678900');
    expect(user.birthDate).toBe('1990-01-01');
    expect(user.phone).toBe('1234567890');
    expect(user.password).toBe('123456');
    expect(user.roles).toStrictEqual([UserRole.USER]);
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);

    user.socialName = 'Johnny';
    expect(user.socialName).toBe('Johnny');
  });

  test('set methods', () => {
    const user = User.create(userProps);

    user.name = 'Jane Doe';
    user.socialName = 'Janey';
    user.email = 'jane@example.com';
    user.cpf = '09876543211';
    user.birthDate = '1992-02-02';
    user.phone = '0987654321';
    user.password = 'newpassword123';

    expect(user.name).toBe('Jane Doe');
    expect(user.socialName).toBe('Janey');
    expect(user.email).toBe('jane@example.com');
    expect(user.cpf).toBe('09876543211');
    expect(user.birthDate).toBe('1992-02-02');
    expect(user.phone).toBe('0987654321');
    expect(user.password).toBe('newpassword123');
  });

  test('deactivate and reactivate methods', () => {
    const user = User.create(userProps);

    user.deactivate();
    expect(user.isActive).toBe(false);

    user.reactivate();
    expect(user.isActive).toBe(true);
  });
});
