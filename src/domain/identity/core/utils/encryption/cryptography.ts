export abstract class Cryptography {
  abstract hash(plain: string): Promise<string>;

  abstract compare(plain: string, hashed: string): Promise<boolean>;
}
