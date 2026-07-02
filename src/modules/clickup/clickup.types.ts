import { ScreenValidationResult } from '../../core/types/validation.types';

export interface CreateTaskRequest {
    name: string;
    description: string;
    priority?: number;
    tags?: string[];
}

export interface ClickUpTask {
    id: string;
    name: string;
    url: string;
}

/**
 * Complete bug information used by ClickUp.
 */
export interface CreateBugRequest {
    validation: ScreenValidationResult;
}