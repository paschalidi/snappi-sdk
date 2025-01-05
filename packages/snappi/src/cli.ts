#!/usr/bin/env node
import { program } from 'commander';
import { generateConfig } from './config-generator';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { captureReferences } from "./index";
import { createApiConfig, pollForResults, uploadScreenshots, withRetry } from "./services/api";
import { createBrowser, createPage, takeScreenshot } from "./browser";
import ora from 'ora';
import { Screenshot } from "./services/types";

const loadConfig = async (configPath: string) => {
  try {
    const configFile = await readFile(join(process.cwd(), configPath), 'utf8');
    return JSON.parse(configFile);
  } catch (error) {
    throw new Error(`Failed to load config file: ${error instanceof Error ? error.message : String(error)}`);
  }
};


program
  .name('snappi')
  .description('Visual regression testing made simple')
  .version('0.1.0');

program
  .command('init')
  .description('Generate Snappi configuration from Storybook')
  .option('-u, --url <url>', 'Storybook URL', 'http://localhost:6006')
  .option('-d, --dir <directory>', 'Storybook static directory', 'storybook-static')
  .option('-o, --output <path>', 'Output path for config file', './snappi.config.json')
  .action(async (options) => {
    try {
      console.log('Generating configuration...');
      console.log('Options:', options); // Debug log

      await generateConfig({
        storybookUrl: options.url,
        storybookStaticDir: options.dir,
        outputPath: options.output
      });
      console.log(`✨ Configuration generated at ${options.output}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('capture')
  .description('Capture new reference screenshots for all scenarios')
  .option('-c, --config <path>', 'Path to config file', './snappi.config.json')
  .option('-f, --force', 'Force overwrite existing references', false)
  .action(async (options) => {
    try {
      console.log('Reading configuration...');
      const config = await loadConfig(options.config);

      console.log('Starting reference capture...');
      await captureReferences({
        ...config,
        mode: 'reference',
        forceReference: options.force,
        verbose: true
      });

      console.log('✨ Reference screenshots captured successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });



program
  .command('test')
  .description('Run visual regression tests')
  .option('-c, --config <path>', 'Path to config file', './snappi.config.json')
  .option('-o, --output <dir>', 'Output directory', '.snappi')
  .option('-k, --api-key <key>', 'Snappi API key')
  .option('-u, --api-url <url>', 'Snappi API URL')
  .option('-t, --timeout <ms>', 'Maximum wait time in milliseconds', '600000')
  .action(async (options) => {
    const spinner = ora('Snappi begins').start();
    try {
      // Validate API key
      const apiKey = options.apiKey || process.env.SNAPPI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is required. Use --api-key or set SNAPPI_API_KEY environment variable');
      }

      // Create API config
      const apiConfig = createApiConfig(apiKey, {
        baseUrl: options.apiUrl,
        maxWaitTime: parseInt(options.timeout)
      });

      // Read test config
      spinner.text = 'Reading configuration...';
      const config = await loadConfig(options.config);

      // Capture screenshots
      spinner.text = 'Capturing screenshots...';
      const browser = await createBrowser();
      const screenshots: Screenshot[] = [];

      for (const scenario of config.scenarios) {
        for (const viewport of config.viewports) {
          spinner.text = `📸 Capturing: ${scenario.label} (${viewport.label})`;
          const page = await createPage(browser, viewport, scenario);

          try {
            const screenshot = await takeScreenshot(
              page,
              scenario,
              0,
              config.maxRetries,
              config.defaultDelay
            );

            // Save screenshot temporarily
            const tempPath = join(options.output, 'temp', `${scenario.label}_${viewport.label}.png`);
            await mkdir(dirname(tempPath), { recursive: true });
            await writeFile(tempPath, screenshot);

            screenshots.push({
              path: tempPath,
              label: scenario.label,
              viewport: viewport.label
            });

          } finally {
            await page.close();
          }
        }
      }

      await browser.close();

      // Upload screenshots with retry
      spinner.text = 'Uploading screenshots to Snappi...';
      const runId = await withRetry(
        () => uploadScreenshots(screenshots, apiConfig),
        3
      );
      spinner.succeed(`Started test run: ${runId}`);

      // Poll for results
      spinner.start('Processing screenshots...');
      const results = await pollForResults(
        runId,
        apiConfig,
        (completed, total) => {
          spinner.text = `Processing screenshots... ${completed}/${total}`;
        }
      );
      spinner.succeed('Processing complete!');

      // Display results
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      console.log(`\n✨ Test run complete: ${passed}/${total} passed`);

      if (passed < total) {
        console.log('\nFailed tests:');
        results
          .filter(r => !r.passed)
          .forEach(r => {
            console.log(`❌ ${r.scenario} (${r.viewport}): ${r.error || `Diff: ${r.diffPercentage?.toFixed(2)}%`}`);
          });
        process.exit(1);
      }

    } catch (error) {
      spinner?.fail('Test run failed');
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();