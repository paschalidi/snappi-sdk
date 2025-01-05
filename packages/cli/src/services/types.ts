export interface RunStatus {
  state: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  completedComparisons?: number;
  totalComparisons?: number;
  results?: TestResult[];
  error?: string;
}

export interface Screenshot {
  path: string;
  label: string;
  viewport: string;
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

export interface ApiConfig {
  apiKey: string;
  baseUrl?: string;
  pollInterval?: number;  // ms
  maxWaitTime?: number;   // ms
}