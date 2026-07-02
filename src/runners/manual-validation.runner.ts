import fs from 'fs-extra';
import path from 'path';

import { ManualValidationWorkflow } from '../modules/workflow/manual-validation.workflow';

async function run(): Promise<void> {
  const screenName = process.argv[2];

  if (!screenName) {
    console.error(
      'Usage:\n' +
      'npm run manual:compare -- <ScreenName>'
    );

    process.exit(1);
  }

  const expectedImagePath = path.join(
    process.cwd(),
    'input',
    'expected',
    `${screenName}.png`
  );

  const actualImagePath = path.join(
    process.cwd(),
    'input',
    'actual',
    `${screenName}.png`
  );

  if (!(await fs.pathExists(expectedImagePath))) {
    throw new Error(
      `Expected image not found: ${expectedImagePath}`
    );
  }

  if (!(await fs.pathExists(actualImagePath))) {
    throw new Error(
      `Actual image not found: ${actualImagePath}`
    );
  }

  const workflow = new ManualValidationWorkflow();

  const result = await workflow.validate({
    screenName,
    expectedImagePath,
    actualImagePath,
  });

  console.log('\n===================================');
  console.log('MANUAL VALIDATION RESULT');
  console.log('===================================');

  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});