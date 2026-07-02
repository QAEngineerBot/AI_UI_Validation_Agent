import { BaseFrameworkError } from './base.error';

export class GeminiError extends BaseFrameworkError {
  constructor(message: string, code = 'GEMINI_ERROR', details?: unknown) {
    super(message, code, details);
  }
}