/**
 * Base framework error.
 * All custom module errors can extend this class later.
 */
export class BaseFrameworkError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code = 'FRAMEWORK_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}