import { BaseFrameworkError } from './base.error';

export class FigmaError extends BaseFrameworkError {
  constructor(message: string, code = 'FIGMA_ERROR', details?: unknown) {
    super(message, code, details);
  }
}