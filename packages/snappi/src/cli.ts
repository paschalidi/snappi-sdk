#!/usr/bin/env node
import { program } from 'commander';
import { generateConfig } from './config-generator';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { captureReferences, runVisualTests } from "./index";

console.log('Snappi CLI');
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
      const config = require(join(process.cwd(), options.config));

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
  .description('Capture reference screenshots for all scenarios')
  .option('-c, --config <path>', 'Path to config file', './snappi.config.json')
  .option('-o, --output <dir>', 'Output directory', '.snappi')
  .option('-m, --mode <mode>', 'Capture mode: reference or test', 'baseline')
  .action(async (options) => {
    try {
      console.log('Setting up snapshot directories...');
      const snappiDir = options.output;
      const referencesDir = join(snappiDir, 'references');
      const testsDir = join(snappiDir, 'tests');
      const diffsDir = join(snappiDir, 'diffs');

      // Create directories
      await mkdir(snappiDir, { recursive: true });
      await mkdir(referencesDir, { recursive: true });
      await mkdir(testsDir, { recursive: true });
      await mkdir(diffsDir, { recursive: true });

      console.log('Reading configuration...');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = require(join(process.cwd(), options.config));

      console.log('Starting capture process...');
      await runVisualTests({
        ...config,
        paths: {
          baselineDir: referencesDir,
          compareDir: testsDir,
          diffDir: diffsDir
        }
      });

      console.log('✨ Screenshots captured successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });


program.parse();