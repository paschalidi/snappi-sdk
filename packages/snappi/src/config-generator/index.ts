import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import type { ConfigGeneratorOptions, StorybookData, StorybookStory } from './types';
import type { ScenarioConfig, VisualTestConfig } from '../types';
import { DEFAULT_SCENARIO_CONFIG, DEFAULT_VIEWPORTS } from './defaults';

export async function generateConfig(options: ConfigGeneratorOptions = {}): Promise<VisualTestConfig> {
  const {
    storybookUrl = 'http://localhost:6006',
    storybookStaticDir = 'storybook-static',
    outputPath = './snappi.config.json',
    viewports = DEFAULT_VIEWPORTS,
    customScenarioConfig = {}
  } = options;

  try {
    // Resolve the path to stories.json
    const storiesPath = resolve(process.cwd(), storybookStaticDir, 'index.json');

    // Read and parse the stories data
    const storiesData: StorybookData = JSON.parse(
      await readFile(storiesPath, 'utf8')
    );

    // Filter and transform stories into scenarios
    const scenarios: ScenarioConfig[] = Object.values(storiesData.entries)
      .filter(story => !isDocStory(story))
      .map(story => createScenario(story, storybookUrl, customScenarioConfig));

    // Create the complete config
    const config: VisualTestConfig = {
      id: 'snappi-visual-test',
      viewports,
      scenarios,
      defaultDelay: DEFAULT_SCENARIO_CONFIG.delay,
      defaultMisMatchThreshold: DEFAULT_SCENARIO_CONFIG.misMatchThreshold
    };

    // Write config to file if outputPath is provided
    if (outputPath) {
      await writeFile(
        outputPath,
        JSON.stringify(config, null, 2),
        'utf8'
      );
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to generate Snappi config: ${error.message}\n` +
        'Make sure you have built your Storybook first with "storybook build"'
      );
    }
    throw error;
  }
}

function isDocStory(story: StorybookStory): boolean {
  return story.id.toLowerCase().includes('docs') ||
    (story.title || '').toLowerCase().includes('docs');
}

function createScenario(
  story: StorybookStory,
  baseUrl: string,
  customConfig: Partial<ScenarioConfig>
): ScenarioConfig {
  // Replace slashes with hyphens before creating the ID
  const storyId = `${story.title?.toLowerCase()?.replace(/\//g, '-')}--${story.name?.toLowerCase()}`;

  // Manually construct the URL to avoid automatic encoding of slashes
  return {
    label: story.name,
    url: `${baseUrl}/iframe.html?args=&id=${storyId}&viewMode=story`,
    waitForSelector: '#storybook-root',
    delay: 1000,
    ...DEFAULT_SCENARIO_CONFIG,
    ...customConfig
  };
}