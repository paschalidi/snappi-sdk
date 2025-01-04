import * as core from '@actions/core';
import { VisualTestConfig } from '@reshot-sdk/snappi';

export interface ActionConfig extends VisualTestConfig {
  apiKey: string;
  storybookBuild: string;
  storybookDir: string;
}

export function getConfig(): ActionConfig {
  return {
    apiKey: core.getInput('api-key', { required: true }),
    id: "runs-on-ghaction",
    scenarios: [],
    viewports: [],
    storybookBuild: core.getInput('storybook-build') || 'build-storybook',
    storybookDir: core.getInput('storybook-dir') || 'storybook-static',
    defaultDelay: parseInt(core.getInput('delay') || '300', 10),
    defaultMisMatchThreshold: parseFloat(core.getInput('threshold') || '0.1'),
    maxRetries: parseInt(core.getInput('max-retries') || '1', 10),
    maxConcurrency: parseInt(core.getInput('maxConcurrency') || '1', 10),
    verbose: true  // Always verbose in CI
  };
}