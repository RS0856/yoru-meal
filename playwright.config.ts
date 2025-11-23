import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

// .envファイルから環境変数を読み込む
config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

/**
 * Playwrightの設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストファイルの場所
  testDir: './e2e',
  
  // テストの実行方法
  fullyParallel: true,
  
  // CI環境での失敗時の再試行回数
  retries: process.env.CI ? 2 : 0,
  
  // CI環境での並列実行数
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター設定
  reporter: 'html',
  
  // 共有設定
  use: {
    // ベースURL（開発サーバーのURL）
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // スクリーンショットの設定
    screenshot: 'only-on-failure',
    
    // 動画の設定
    video: 'retain-on-failure',
    
    // トレースの設定
    trace: 'on-first-retry',
  },

  // プロジェクト設定（複数のブラウザでテストを実行）
  projects: [
    // 認証状態を保存するsetupプロジェクト
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 認証不要のテスト
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: [],
      // 認証が必要なテストファイルを除外
      testIgnore: /(full-flow|propose)\.spec\.ts/,
    },
    // 認証が必要なテスト
    {
      name: 'chromium-authenticated',
      use: { 
        ...devices['Desktop Chrome'],
        // 認証状態を読み込む
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      // 認証が必要なテストファイルを指定
      testMatch: /(full-flow|propose)\.spec\.ts/,
    },
    // 必要に応じて他のブラウザも追加可能
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 開発サーバーの設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

