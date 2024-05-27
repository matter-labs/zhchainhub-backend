export abstract class BaseError extends Error {
  readonly name: string;
  readonly description: string;

  constructor({ name, description }: { name: string; description: string }) {
    super(description);
    this.name = name;
    this.description = description;
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  public getDescription(): string {
    return this.description;
  }
}
