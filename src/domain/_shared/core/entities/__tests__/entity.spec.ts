import { Entity } from '../entity';

interface TestProps {
  name: string;
  age: number;
}

class TestEntity extends Entity<TestProps> {
  constructor(props: TestProps, id?: string, createdAt?: Date, updatedAt?: Date) {
    super(props, id, createdAt, updatedAt);
  }
}

describe('Entity', () => {
  it('should create an entity with default values', () => {
    const props = { name: 'John Doe', age: 30 };
    const entity = new TestEntity(props);

    expect(entity).toBeDefined();
    expect(entity.toJSON()).toEqual({
      id: entity.id,
      name: 'John Doe',
      age: 30,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  });

  it('should create an entity with provided values', () => {
    const props = { name: 'Jane Doe', age: 25 };
    const id = 'test-id';
    const createdAt = new Date('2023-01-01T00:00:00Z');
    const updatedAt = new Date('2023-01-02T00:00:00Z');
    const entity = new TestEntity(props, id, createdAt, updatedAt);

    expect(entity.id).toBe(id);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
    expect(entity.toJSON()).toEqual({
      id,
      name: 'Jane Doe',
      age: 25,
      createdAt,
      updatedAt,
    });
  });
});
