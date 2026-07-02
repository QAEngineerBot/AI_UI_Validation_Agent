import { logger } from '../core/logger/logger';

import { ImageLoader } from '../modules/loader/image-loader';
import { UiValidationWorkflow } from '../modules/workflow/ui-validation.workflow';
import { ClickUpService } from '../modules/clickup/clickup.service';
import { ScreenValidationResult } from '../core/types/validation.types';
import { ReportService } from '../modules/report/report.service';

async function run(): Promise<void> {
  const startTime = Date.now();

  logger.info('========================================');
  logger.info('AI UI Validation Started');
  logger.info('========================================');

  const loader = new ImageLoader();
  const workflow = new UiValidationWorkflow();
  const clickup = new ClickUpService();
  const reportService = new ReportService();

  const loadResult = await loader.load();

  if (loadResult.missingExpected.length > 0) {
    logger.warn(
      `Missing expected images: ${loadResult.missingExpected.join(', ')}`
    );
  }

  if (loadResult.missingActual.length > 0) {
    logger.warn(
      `Missing actual images: ${loadResult.missingActual.join(', ')}`
    );
  }

  if (loadResult.pairs.length === 0) {
    logger.warn('No matching image pairs found.');
    return;
  }

  let passCount = 0;
  let failCount = 0;
  let errorCount = 0;

  const results: ScreenValidationResult[] = [];

  for (const pair of loadResult.pairs) {
    logger.info('----------------------------------------');
    logger.info(`Validating ${pair.screenName}`);
    logger.info('----------------------------------------');

    try {
      const result = await workflow.validateScreen({
        screenName: pair.screenName,
        actualImagePath: pair.actualImagePath,
        failOnSeverityOrAbove: 'MEDIUM',
      });

      results.push(result);

      if (result.status === 'PASS') {
        passCount++;

        logger.info(`PASS : ${pair.screenName}`);
      } else {
        failCount++;

        logger.warn(`FAIL : ${pair.screenName}`);

      }
    } catch (error) {
      errorCount++;

      logger.error(
        `Validation failed for "${pair.screenName}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Generate HTML report
  const report = await reportService.generate({
  results,
});

logger.info(`HTML Report: ${report.reportPath}`);


for (const result of results) {

  if (result.status === 'FAIL') {

    await clickup.createOrUpdateBug(
      result,
      report.reportPath
    );

  }

}

  // ------------------------------------------------------------------
  // Next Phase
  // ------------------------------------------------------------------
  // const reportGenerator = new HtmlReportGenerator();
  // await reportGenerator.generate(results);

  const totalExecutionTime = Date.now() - startTime;

  logger.info('');
  logger.info('========================================');
  logger.info('Execution Summary');
  logger.info('========================================');

  logger.info(`PASS   : ${passCount}`);
  logger.info(`FAIL   : ${failCount}`);
  logger.info(`ERROR  : ${errorCount}`);
  logger.info(`TOTAL  : ${results.length + errorCount}`);
  logger.info(`TIME   : ${totalExecutionTime} ms`);

  logger.info('========================================');
}

run().catch((error) => {
  logger.error(
    error instanceof Error ? error.message : String(error)
  );

  process.exit(1);
});