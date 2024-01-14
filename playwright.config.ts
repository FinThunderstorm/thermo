import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000

const config: PlaywrightTestConfig = {
  testDir: './src/tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? 'github'
    : [['html', { outputFolder: 'test-results/test-report' }]],
  shard: {
    current: process.env.PLAYWRIGHT_SHARD
      ? parseInt(process.env.PLAYWRIGHT_SHARD as string)
      : 1,
    total: process.env.PLAYWRIGHT_TOTAL_SHARDS
      ? parseInt(process.env.PLAYWRIGHT_TOTAL_SHARDS as string)
      : 1
  },
  use: {
    actionTimeout: 0,
    baseURL: `http://127.0.0.1:${PORT}`,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    testIdAttribute: 'data-test-id'
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },

    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5']
      }
    }
  ],
  outputDir: 'test-results/playwright',
  webServer: {
    reuseExistingServer: false,
    command: `PORT=${PORT} ./scripts/start-test-server.sh`,
    port: PORT,
    timeout: 120 * 1000
  }
}

export default config
