# TypeScript SDK

The TypeScript SDK provides a minimal interface for browser automation and screenshot capture, serving as the main entry
point for developers integrating Snappi.

## Core Functionality

The SDK is intentionally thin, focusing on:

- Browser automation with Playwright
- Screenshot capture
- Upload management
- Status polling

## Implementation

```typescript
export async function captureScreenshots(config: Config): Promise<CaptureResult> {
  // Handle browser automation and screenshot capture
  const screenshots = await takeScreenshots();

  // Upload to Rust backend
  const response = await fetch('http://api.snappi.dev/runs', {
    method: 'POST',
    body: createFormData(screenshots),
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });

  return response.json();
}
```

## API Structure

```typescript
interface Config {
  storybookDir: string;
  viewports: Viewport[];
  apiKey: string;
}

interface CaptureResult {
  runId: string;
  status: 'queued' | 'processing' | 'completed';
  timestamp: string;
}

interface Viewport {
  name: string;
  width: number;
  height: number;
}
```

Usage Examples

```typescript
import { SnappiClient } from '@reshot/snappi';

const client = new SnappiClient({
  apiKey: 'your-api-key'
});

const result = await client.captureScreenshots({
  storybookDir: './storybook-static',
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'desktop', width: 1440, height: 900 }
  ]
});
```

