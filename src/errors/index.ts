// Business errors. The UI/API layer can map these to HTTP codes (400, 404, 429).

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(public readonly issues: string[]) {
    super(`Validation failed: ${issues.join("; ")}`);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, key: string) {
    super(`${entity} not found: ${key}`);
  }
}

export class ConflictError extends DomainError {}

export class RateLimitError extends DomainError {}
