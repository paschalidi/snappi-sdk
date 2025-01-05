// src/api/mock.ts
import type { RunStatus, Screenshot, TestResult } from './types';
import { randomUUID } from 'crypto';

// In-memory storage
const runs = new Map<string, {
  status: RunStatus;
  startTime: number;
  screenshots: Screenshot[];
}>();

// Simulate processing time per image (2-4 seconds)
const PROCESS_TIME_PER_IMAGE = () => 2000 + Math.random() * 2000;

export const mockUploadScreenshots = async (
  screenshots: Screenshot[]
): Promise<string> => {
  const runId = randomUUID();

  // Store run data
  runs.set(runId, {
    screenshots,
    startTime: Date.now(),
    status: {
      state: 'IN_PROGRESS',
      completedComparisons: 0,
      totalComparisons: screenshots.length,
      results: []
    }
  });

  // Simulate processing in background
  processScreenshots(runId);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return runId;
};

export const mockGetRunStatus = async (
  runId: string
): Promise<RunStatus> => {
  const run = runs.get(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return run.status;
};

// Helper to simulate background processing
const processScreenshots = async (runId: string) => {
  const run = runs.get(runId);
  if (!run) return;

  const results: TestResult[] = [];

  for (let i = 0; i < run.screenshots.length; i++) {
    const screenshot = run.screenshots[i];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, PROCESS_TIME_PER_IMAGE()));

    // Generate a random pass/fail result
    const passed = Math.random() > 0.2; // 80% pass rate
    const diffPercentage = passed ? Math.random() * 0.1 : 0.1 + Math.random() * 0.4;

    results.push({
      scenario: screenshot.label,
      viewport: screenshot.viewport,
      passed,
      diffPercentage,
      diffPath: passed ? undefined : '/mock/diff/path.png',
      baselinePath: '/mock/baseline/path.png',
      comparePath: '/mock/compare/path.png',
      error: passed ? undefined : 'Visual differences detected'
    });

    // Update run status
    run.status = {
      ...run.status,
      completedComparisons: i + 1,
      results
    };
  }

  // Mark as complete
  run.status.state = 'COMPLETED';
};

// Create a mock version of the API
export const createMockApi = () => ({
  uploadScreenshots: mockUploadScreenshots,
  getRunStatus: mockGetRunStatus,
});