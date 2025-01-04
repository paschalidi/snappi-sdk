import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { which } from '@actions/io';
import { runVisualTests, TestResult } from '@reshot-sdk/snappi';
import { ActionConfig } from './config';

export async function run(config: ActionConfig): Promise<TestResult[]> {
  // Ensure npm is available
  await which('npm', true);

  // Build Storybook
  core.startGroup('Building Storybook');
  await exec('npm', ['run', config.storybookBuild]);
  core.endGroup();

  // Run visual tests
  core.startGroup('Running visual tests');
  const results = await runVisualTests({
    ...config,
    paths: {
      baselineDir: '.snappi/references',
      compareDir: '.snappi/tests',
      diffDir: '.snappi/diffs'
    }
  });
  core.endGroup();

  // Log results
  core.startGroup('Test Results');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  core.info(`Total Tests: ${results.length}`);
  core.info(`Passed: ${passed}`);
  core.info(`Failed: ${failed}`);

  results.forEach(result => {
    if (!result.passed) {
      core.error(`❌ ${result.scenario} (${result.viewport}) - ${
        result.diffPercentage
          ? `Diff: ${result.diffPercentage.toFixed(2)}%`
          : result.error
      }`);
    }
  });
  core.endGroup();

  return results;
}