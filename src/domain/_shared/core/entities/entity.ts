import { randomUUID } from 'node:crypto';

export abstract class Entity<Props> {
  private _id: string;

  protected props: Props;

  protected _createdAt: Date;

  protected _updatedAt: Date;

  get id() {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected constructor(props: Props, id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id ?? randomUUID();
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
    this.props = props;
  }

  protected touch() {
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      ...this.props,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
