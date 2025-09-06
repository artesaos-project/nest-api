import { Entity } from '@/domain/_shared/core/entities/entity';

export enum UserRole {
  USER = 'USER',
  ARTISAN = 'ARTISAN',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  name: string;
  email: string;
  password: string;
  cpf: string;
  socialName?: string;
  birthDate: string;
  phone: string;
  roles: UserRole[];
  isActive: boolean;
}

type CreateUserProps = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  socialName?: string;
  birthDate: string;
  phone: string;
  roles?: UserRole[];
};

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string, createdAt?: Date, updatedAt?: Date) {
    super(props, id, createdAt, updatedAt);
  }

  static create(
    props: CreateUserProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): User {
    return new User({
      ...props,
      roles: props.roles ?? [UserRole.USER],
      isActive: true,
    }, id, createdAt, updatedAt);
  }

  get name(): string {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
    this.touch();
  }

  get email(): string {
    return this.props.email;
  }

  set email(value: string) {
    this.props.email = value;
    this.touch();
  }

  get password(): string {
    return this.props.password;
  }

  set password(value: string) {
    this.props.password = value;
    this.touch();
  }

  get cpf(): string {
    return this.props.cpf;
  }

  set cpf(value: string) {
    this.props.cpf = value;
    this.touch();
  }

  get socialName(): string | undefined {
    return this.props.socialName ?? undefined;
  }

  set socialName(value: string | undefined) {
    this.props.socialName = value;
    this.touch();
  }

  get birthDate(): string {
    return this.props.birthDate;
  }

  set birthDate(value: string) {
    this.props.birthDate = value;
    this.touch();
  }

  get phone(): string {
    return this.props.phone;
  }

  set phone(value: string) {
    this.props.phone = value;
    this.touch();
  }

  get roles(): UserRole[] {
    return this.props.roles;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  deactivate() {
    this.props.isActive = false;
    this.touch();
  }

  reactivate() {
    this.props.isActive = true;
    this.touch();
  }
}
