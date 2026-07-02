import { ScreenValidationResult } from '../../core/types/validation.types';
import {
  CreateBugRequest,
  CreateTaskRequest,
} from './clickup.types';

export class ClickUpMapper {
  map(request: CreateBugRequest): CreateTaskRequest {
    return {
      name: this.buildTitle(request.validation),
      description: this.buildDescription(request.validation),
      tags: ['AI', 'UI Validation'],
    };
  }

  private buildTitle(
    validation: ScreenValidationResult
  ): string {
    return `${validation.screenName} Screen UI Issues`;
  }

  private buildDescription(
    validation: ScreenValidationResult
  ): string {
    const lines: string[] = [];

    lines.push('# AI UI Validation Report');
    lines.push('');

    lines.push('## Screen');
    lines.push(validation.screenName);
    lines.push('');

    lines.push('## Overall Status');
    lines.push(validation.status);
    lines.push('');

    lines.push('## AI Summary');
    lines.push(validation.comparison.summary);
    lines.push('');

    lines.push('## Total Issues');
    lines.push(validation.comparison.issues.length.toString());
    lines.push('');

    if (validation.failureReason) {
      lines.push('## Failure Reason');
      lines.push(validation.failureReason);
      lines.push('');
    }

    lines.push('## Issues');
    lines.push('');

    validation.comparison.issues.forEach((issue, index) => {
      lines.push(`### Issue ${index + 1}`);
      lines.push('');
      lines.push(`Severity : ${issue.severity}`);
      lines.push(`Category : ${issue.category}`);
      lines.push('');
      lines.push('Description');
      lines.push(issue.description);
      lines.push('');
      lines.push('Recommendation');
      lines.push(issue.recommendation);
      lines.push('');
      lines.push('----------------------------------------');
      lines.push('');
    });

    return lines.join('\n');
  }
}