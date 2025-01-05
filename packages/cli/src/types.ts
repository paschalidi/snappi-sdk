// src/types.ts
export interface ViewportConfig {
  label: string;
  width: number;
  height: number;
}

export interface ScenarioConfig {
  label: string;
  url: string;
  selectors?: string[];
  delay?: number;
  misMatchThreshold?: number;
  waitForSelector?: string;
  removeSelectors?: string[];
  clickSelectors?: string[];
  hideSelectors?: string[];
  isMobile?: boolean;
  colorScheme?: 'light' | 'dark';
}

export interface VisualTestConfig {
  id: string;
  mode?: 'test' | 'reference';
  forceReference?: boolean;
  maxConcurrency?: number;
  verbose?: boolean;
  viewports: ViewportConfig[];
  scenarios: ScenarioConfig[];
  paths?: {
    baselineDir?: string;
    compareDir?: string;
    diffDir?: string;
  };
  defaultDelay?: number;
  defaultMisMatchThreshold?: number;
  maxRetries?: number;
}


export interface CaptureResult {
  scenario: string;      // Name of the scenario
  viewport: string;      // Viewport label
  success: boolean;      // Whether capture was successful
  path?: string;         // Path where image was saved (if successful)
  error?: string;        // Error message (if failed)
}

export interface TestResult {
  scenario: string;
  viewport: string;
  passed: boolean;
  diffPercentage?: number;
  diffPath?: string;
  baselinePath: string;
  comparePath: string;
  error?: string;
}