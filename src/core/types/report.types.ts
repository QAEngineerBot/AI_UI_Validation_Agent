import { Severity, ValidationStatus } from './common.types';

export interface ScreenValidationIssue {
  severity: Severity;
  description: string;
  recommendation: string;
}

export interface ScreenValidationResult {
  screenName: string;
  timestamp: string;
  expectedDesignPath: string;
  actualScreenshotPath: string;
  issues: ScreenValidationIssue[];
  status: ValidationStatus;
}