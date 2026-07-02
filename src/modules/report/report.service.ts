import fs from "fs-extra";
import path from "path";

import { logger } from "../../core/logger/logger";

import {
  ReportGenerationRequest,
  ReportGenerationResult,
  ReportScreenValidationResult
} from "./report.types";

import { ReportTemplate } from "./report.template";

export class ReportService {
  private readonly template = new ReportTemplate();

  private async imageToBase64(imagePath: string): Promise<string> {
    const buffer = await fs.readFile(imagePath);

    const extension = path.extname(imagePath).replace(".", "");

    return `data:image/${extension};base64,${buffer.toString("base64")}`;
  }

  async generate(
    request: ReportGenerationRequest,
  ): Promise<ReportGenerationResult> {
    const reportsDir = path.join(process.cwd(), "reports", "html");

    await fs.ensureDir(reportsDir);

    const now = new Date();

    const pad = (value: number): string => value.toString().padStart(2, "0");

    const timestamp =
      `${now.getFullYear()}-` +
      `${pad(now.getMonth() + 1)}-` +
      `${pad(now.getDate())}_` +
      `${pad(now.getHours())}-` +
      `${pad(now.getMinutes())}-` +
      `${pad(now.getSeconds())}`;

    const reportName = `Test_Report_${timestamp}.html`;

    const reportPath = path.join(reportsDir, reportName);

    const reportResults: ReportScreenValidationResult[] = await Promise.all(
      request.results.map(async (result) => ({
        ...result,

        expectedImageBase64: await this.imageToBase64(result.expectedImagePath),

        actualImageBase64: await this.imageToBase64(result.actualImagePath),
      })),
    );

    const html = this.template.build(reportResults);

    await fs.writeFile(reportPath, html, "utf8");

    logger.info(`HTML report generated: ${reportPath}`);

    return {
      reportPath,
    };
  }
}
