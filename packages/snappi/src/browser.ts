import { type Browser, chromium, type Page } from '@playwright/test';
import type { ScenarioConfig, ViewportConfig } from './types';

export async function createBrowser(): Promise<Browser> {
  return await chromium.launch({
    args: ['--no-sandbox']
  });
}

export async function createPage(
  browser: Browser,
  viewport: ViewportConfig,
  scenario: ScenarioConfig
): Promise<Page> {
  const context = await browser.newContext({
    viewport: {
      width: viewport.width,
      height: viewport.height
    },
    deviceScaleFactor: 1,
    colorScheme: scenario.colorScheme,
    isMobile: scenario.isMobile
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  return page;
}

export async function takeScreenshot(
  page: Page,
  scenario: ScenarioConfig,
  retryCount = 0,
  maxRetries = 2,
  defaultDelay = 0
): Promise<Buffer> {
  try {
    await page.goto(scenario.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    if (scenario.waitForSelector) {
      await page.waitForSelector(scenario.waitForSelector);
    }

    if (scenario.removeSelectors) {
      await Promise.all(
        scenario.removeSelectors.map(selector =>
          page.evaluate((sel) => {
            document.querySelectorAll(sel).forEach(el => el.remove());
          }, selector)
        )
      );
    }

    if (scenario.hideSelectors) {
      await Promise.all(
        scenario.hideSelectors.map(selector =>
          page.evaluate((sel) => {
            document.querySelectorAll(sel).forEach(
              el => (el as HTMLElement).style.visibility = 'hidden'
            );
          }, selector)
        )
      );
    }

    if (scenario.clickSelectors) {
      await Promise.all(
        scenario.clickSelectors.map(selector =>
          page.click(selector)
        )
      );
    }

    await page.evaluate(() => window.requestAnimationFrame(() => {
    }));
    await page.waitForTimeout(scenario.delay ?? defaultDelay);

    return await page.screenshot({
      fullPage: true,
      type: 'png',
      scale: 'device'
    });
  } catch (error) {
    console.log('Error:', error);
    if (retryCount < maxRetries) {
      console.warn(`Retrying screenshot for ${scenario.label} (${retryCount + 1})`);
      return takeScreenshot(page, scenario, retryCount + 1, maxRetries, defaultDelay);
    }
    throw error;
  }
}
