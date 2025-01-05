import type { TestResult } from '../types';
import { createMockApi } from './mock';

export interface ApiConfig {
  apiKey: string;
  baseUrl?: string;
  pollInterval?: number;
  maxWaitTime?: number;
}

export interface Screenshot {
  path: string;
  label: string;
  viewport: string;
}

export interface RunStatus {
  state: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  completedComparisons?: number;
  totalComparisons?: number;
  results?: TestResult[];
  error?: string;
}

const DEFAULT_CONFIG = {
  pollInterval: 5000,
  maxWaitTime: 600000
};

// Get the mock API implementation
const api = createMockApi();

// Upload screenshots and get run ID
export const uploadScreenshots = async (
  screenshots: Screenshot[],
  config: ApiConfig
): Promise<string> => {
  return api.uploadScreenshots(screenshots);
};

// Get current status of a run
export const getRunStatus = async (
  runId: string,
  config: ApiConfig
): Promise<RunStatus> => {
  return api.getRunStatus(runId);
};

// Wait for run to complete
export const pollForResults = async (
  runId: string,
  config: ApiConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<TestResult[]> => {
  const { pollInterval = DEFAULT_CONFIG.pollInterval, maxWaitTime = DEFAULT_CONFIG.maxWaitTime } = config;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getRunStatus(runId, config);

    switch (status.state) {
      case 'COMPLETED':
        return status.results || [];
      case 'FAILED':
        throw new Error(`Run failed: ${status.error}`);
      case 'IN_PROGRESS':
        if (status.completedComparisons && status.totalComparisons && onProgress) {
          onProgress(status.completedComparisons, status.totalComparisons);
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        break;
    }
  }

  throw new Error('Timed out waiting for results');
};

// Retry mechanism for API calls
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError!;
};

// Helper to create validated config
export const createApiConfig = (
  apiKey: string,
  options: Partial<Omit<ApiConfig, 'apiKey'>> = {}
): ApiConfig => ({
  apiKey,
  pollInterval: options.pollInterval || DEFAULT_CONFIG.pollInterval,
  maxWaitTime: options.maxWaitTime || DEFAULT_CONFIG.maxWaitTime,
});