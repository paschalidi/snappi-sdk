import { ScenarioConfig, ViewportConfig } from "../types";

export interface StorybookStory {
  id: string;
  name: string;
  title?: string;
  importPath?: string;
}

export interface StorybookData {
  entries: Record<string, StorybookStory>;
}

export interface ConfigGeneratorOptions {
  storybookUrl?: string;
  storybookStaticDir?: string;
  outputPath?: string;
  viewports?: ViewportConfig[];
  customScenarioConfig?: Partial<ScenarioConfig>;
}
