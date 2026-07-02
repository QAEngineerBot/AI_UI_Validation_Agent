import { ScreenValidationResult } from '../../core/types/validation.types';

export interface ReportGenerationRequest {
  results: ScreenValidationResult[];
}

export interface ReportGenerationResult {
  reportPath: string;
}

export interface ReportScreenValidationResult
  extends ScreenValidationResult {

  expectedImageBase64: string;

  actualImageBase64: string;
}