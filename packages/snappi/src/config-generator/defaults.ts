import type { ScenarioConfig, ViewportConfig } from '../types';

export const DEFAULT_VIEWPORTS: ViewportConfig[] = [
  {
    label: 'phone',
    width: 320,
    height: 480
  },
  {
    label: 'tablet',
    width: 768,
    height: 1024
  },
  {
    label: 'desktop',
    width: 1920,
    height: 1080
  }
];


export const DEFAULT_SCENARIO_CONFIG: Partial<ScenarioConfig> = {
  delay: 800,
  misMatchThreshold: 0.1,
};