import { ScreenValidationResult } from '../../core/types/validation.types';

export class CommentBuilder {
  build(validation: ScreenValidationResult): string {
    const lines: string[] = [];

    lines.push('# AI UI Validation Execution');
    lines.push('');

    lines.push(`Execution Time : ${new Date().toLocaleString()}`);
    lines.push('');

    lines.push(`Screen : ${validation.screenName}`);
    lines.push(`Status : ${validation.status}`);
    lines.push('');

    if (validation.failureReason) {
      lines.push(`Failure Reason : ${validation.failureReason}`);
      lines.push('');
    }

    lines.push(`Total Issues : ${validation.failedIssues.length}`);
    lines.push('');

    lines.push('## Issues');
    lines.push('');

    if (validation.failedIssues.length === 0) {
      lines.push('No UI issues detected.');
      lines.push('');
    } else {
      validation.failedIssues.forEach((issue, index) => {
        lines.push(`### Issue ${index + 1}`);
        lines.push('');

        lines.push(`Severity : ${issue.severity}`);
        lines.push(`Category : ${this.formatCategory(issue.category)}`);
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
    }

    if (validation.execution) {
      lines.push('## Execution');
      lines.push('');

      lines.push(
        `Run Id : ${validation.execution.artifacts?.runId ?? 'N/A'}`
      );

      lines.push(
        `Duration : ${validation.execution.metrics.totalMs} ms`
      );

      lines.push('');
    }

    return lines.join('\n');
  }

  private formatCategory(category: string): string {
    return category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}