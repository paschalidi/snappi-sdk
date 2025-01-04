import type { CaptureResult, ScenarioConfig, TestResult, ViewportConfig, VisualTestConfig } from './types';
import { compareImages, ensureDirectories, generateTestRunId, getImagePath } from './utils';
import { createBrowser, createPage, takeScreenshot } from './browser';
import { access, readFile, writeFile } from 'fs/promises';
import { constants } from 'fs';

export async function captureReferences(config: VisualTestConfig): Promise<CaptureResult[]> {
  const runId = generateTestRunId();
  const verbose = config.verbose ?? true;
  await ensureDirectories(config, runId);
  const browser = await createBrowser();
  const results: CaptureResult[] = [];

  if (verbose) {
    console.log(`🏃 Starting reference capture run: ${runId}`);
  }

  try {
    const totalCaptures = config.scenarios.length * config.viewports.length;
    let completed = 0;

    for (const scenario of config.scenarios) {
      for (const viewport of config.viewports) {
        completed++;
        if (verbose) {
          console.log(`📸 [${completed}/${totalCaptures}] Capturing: ${scenario.label} (${viewport.label})`);
          console.log(`   📄 URL: ${scenario.url}`);
        }

        const page = await createPage(browser, viewport, scenario);

        try {
          const baselinePath = getImagePath(config, 'baseline', scenario.label, viewport.label, runId);

          // Check if reference exists and force flag is not set
          if (!config.forceReference) {
            try {
              await access(baselinePath, constants.F_OK);
              if (verbose) {
                console.log('   ⚠️  Reference exists, skipping (use --force to overwrite)');
              }
              continue;
            } catch {
              // Reference doesn't exist, proceed with capture
            }
          }

          const screenshot = await takeScreenshot(
            page,
            scenario,
            0,
            config.maxRetries,
            config.defaultDelay
          );

          await writeFile(baselinePath, screenshot);

          if (verbose) {
            console.log('   ✨ Reference captured');
          }

          results.push({
            scenario: scenario.label,
            viewport: viewport.label,
            path: baselinePath,
            success: true
          });

        } catch (error) {
          if (verbose) {
            console.log('   ❌ Error:', error instanceof Error ? error.message : 'Unknown error');
          }

          results.push({
            scenario: scenario.label,
            viewport: viewport.label,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        } finally {
          await page.close();
        }

        if (verbose) console.log('   -------------------');
      }
    }

    if (verbose) {
      const successful = results.filter(r => r.success).length;
      console.log(`\n✨ Capture complete: ${successful}/${totalCaptures} references captured`);
    }

  } finally {
    await browser.close();
  }

  return results;
}

export async function runVisualTests(config: VisualTestConfig): Promise<TestResult[]> {
  const runId = generateTestRunId();
  const verbose = config.verbose ?? true;
  await ensureDirectories(config, runId);
  const browser = await createBrowser();
  const results: TestResult[] = [];

  if (verbose) {
    console.log(`🏃 Starting test run: ${runId}`);
  }

  try {
    const totalTests = config.scenarios.length * config.viewports.length;
    let completedTests = 0;

    for (const scenario of config.scenarios) {
      for (const viewport of config.viewports) {
        completedTests++;
        if (verbose) {
          console.log(`📸 [${completedTests}/${totalTests}] Testing: ${scenario.label} (${viewport.label})`);
          console.log(`   📄 URL: ${scenario.url}`);
        }

        const page = await createPage(browser, viewport, scenario);

        try {
          const baselinePath = getImagePath(config, 'baseline', scenario.label, viewport.label, runId);
          const comparePath = getImagePath(config, 'compare', scenario.label, viewport.label, runId);
          const diffPath = getImagePath(config, 'diff', scenario.label, viewport.label, runId);

          const screenshot = await takeScreenshot(
            page,
            scenario,
            0,
            config.maxRetries,
            config.defaultDelay
          );

          await writeFile(comparePath, screenshot);

          try {
            // Compare with baseline
            await access(baselinePath, constants.F_OK);
            const baseline = await readFile(baselinePath);
            const threshold = scenario.misMatchThreshold ?? config.defaultMisMatchThreshold ?? 0.1;

            if (verbose) console.log('   🔍 Comparing with baseline...');

            const comparison = await compareImages(baseline, screenshot, diffPath, threshold);

            if (verbose) {
              console.log(`   ${comparison.passed ? '✅' : '❌'} Diff: ${comparison.diffPercentage.toFixed(2)}%`);
            }

            results.push({
              scenario: scenario.label,
              viewport: viewport.label,
              passed: comparison.passed,
              diffPercentage: comparison.diffPercentage,
              diffPath,
              baselinePath,
              comparePath
            });

          } catch (error) {
            if (verbose) console.log('   ❌ Error: No baseline found. Run capture-references first.');

            results.push({
              scenario: scenario.label,
              viewport: viewport.label,
              passed: false,
              error: 'No baseline found',
              baselinePath,
              comparePath
            });
          }
        } catch (error) {
          if (verbose) {
            console.log('   ❌ Error:', error instanceof Error ? error.message : 'Unknown error');
          }

          results.push({
            scenario: scenario.label,
            viewport: viewport.label,
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            baselinePath: '',
            comparePath: ''
          });
        } finally {
          await page.close();
        }

        if (verbose) console.log('   -------------------');
      }
    }

    if (verbose) {
      const passed = results.filter(r => r.passed).length;
      console.log(`\n✨ Test run complete: ${passed}/${totalTests} passed`);
    }

  } finally {
    await browser.close();
  }

  return results;
}

export type {
  ViewportConfig,
  ScenarioConfig,
  VisualTestConfig,
  TestResult
};