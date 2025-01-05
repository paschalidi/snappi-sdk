import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import type { VisualTestConfig } from './types';

export function generateTestRunId(): string {
  const now = new Date();

  // Format: YYYYMMDD-HHMMSS-MSS
  // This ensures lexicographical ordering
  return `${now.getFullYear()}${
    String(now.getMonth() + 1).padStart(2, '0')}${
    String(now.getDate()).padStart(2, '0')}-${
    String(now.getHours()).padStart(2, '0')}${
    String(now.getMinutes()).padStart(2, '0')}${
    String(now.getSeconds()).padStart(2, '0')}-${
    String(now.getMilliseconds()).padStart(3, '0')}`;
}

export function getImagePath(
  config: VisualTestConfig,
  type: 'baseline' | 'compare' | 'diff',
  scenario: string,
  viewport: string,
  runId: string
): string {
  const snappiDir = '.snappi';

  // Map 'compare' to 'tests' in the path
  const typeDir = type === 'baseline' ? 'references' :
    type === 'compare' ? 'tests' :
      'diffs';

  const baseDir = config.paths?.[
    type === 'baseline' ? 'baselineDir' :
      type === 'compare' ? 'compareDir' :
        'diffDir'
    ] ?? join(snappiDir, typeDir);

  if (type !== 'baseline' && runId) {
    // For tests and diffs, include the run ID
    const fullPath = join(baseDir, runId, `${scenario}_${viewport}.png`);
    return fullPath;
  }

  // For baseline/reference images
  return join(baseDir, `${scenario}_${viewport}.png`);
}

// And make sure ensureDirectories matches
export async function ensureDirectories(config: VisualTestConfig, runId: string): Promise<string> {
  const snappiDir = '.snappi';

  // Use consistent naming
  const baselinePath = config.paths?.baselineDir ?? join(snappiDir, 'references');
  const testsPath = config.paths?.compareDir ?? join(snappiDir, 'tests');
  const diffsPath = config.paths?.diffDir ?? join(snappiDir, 'diffs');

  // Create all directories
  await mkdir(baselinePath, { recursive: true });
  await mkdir(join(testsPath, runId), { recursive: true });
  await mkdir(join(diffsPath, runId), { recursive: true });

  return runId;
}

export async function compareImages(
  baseline: Buffer,
  compare: Buffer,
  diffPath: string,
  threshold: number
): Promise<{ diffPercentage: number; passed: boolean }> {
  const img1 = PNG.sync.read(baseline);
  const img2 = PNG.sync.read(compare);
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold,
      diffColor: [255, 0, 0],      // Red for differences
      diffColorAlt: [0, 255, 0],   // Green for additions
      alpha: 0.7,                  // Slight transparency to see underlying image
      aaColor: [255, 255, 0],      // Yellow for anti-aliased pixels
      includeAA: true              // Include anti-aliased pixels in diff
    }
  );

  const diffPercentage = (diffPixels / (width * height)) * 100;

  // Create a blended diff image
  const blendedDiff = new PNG({ width, height });

  // Copy baseline image with reduced opacity
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      blendedDiff.data[idx] = img1.data[idx];     // R
      blendedDiff.data[idx + 1] = img1.data[idx + 1]; // G
      blendedDiff.data[idx + 2] = img1.data[idx + 2]; // B
      blendedDiff.data[idx + 3] = 128;  // Alpha (50% opacity)
    }
  }

  // Overlay diff with full opacity
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      if (diff.data[idx + 3] > 0) {  // If there's a difference
        blendedDiff.data[idx] = diff.data[idx];       // R
        blendedDiff.data[idx + 1] = diff.data[idx + 1];   // G
        blendedDiff.data[idx + 2] = diff.data[idx + 2];   // B
        blendedDiff.data[idx + 3] = 255;  // Full opacity for diffs
      }
    }
  }


  if (diffPercentage > threshold) {
    await writeFile(diffPath, PNG.sync.write(blendedDiff));
  }

  return {
    diffPercentage,
    passed: diffPercentage <= threshold
  };
}