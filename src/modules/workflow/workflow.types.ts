import { Severity } from '../../core/types/common.types';

export interface ValidateScreenWorkflowInput {

  screenName: string;

  expectedImagePath?: string;

  actualImagePath: string;

  forceRefresh?: boolean;

  failOnSeverityOrAbove?:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';
}