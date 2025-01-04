// src/index.ts
import * as core from '@actions/core';
import { run } from './run';
import { getConfig } from './config';

async function main() {
  try {
    // Get inputs
    const config = getConfig();

    // Run the action
    const results = await run(config);

    // Set outputs
    core.setOutput('result-summary', {
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      total: results.length
    });

    core.setOutput('failed-tests', results.filter(r => !r.passed).length);
    core.setOutput('total-tests', results.length);

    // Fail the action if there are failures and failOnDiff is true
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      core.setFailed(`${failedTests.length} visual test(s) failed`);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

main();
