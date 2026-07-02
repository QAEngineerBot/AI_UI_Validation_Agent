import { ScreenValidationResult } from '../../core/types/validation.types';

export interface ReportGenerationRequest {
  results: ScreenValidationResult[];
}

export interface ReportGenerationResult {
  reportPath: string;
}