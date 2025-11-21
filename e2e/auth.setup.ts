import { test as setup } from '@playwright/test';
import { chromium } from '@playwright/test';
import { saveAuthenticatedState } from './auth-helpers';

/**
 * 認証状態を保存するsetupスクリプト
 * このスクリプトは、テスト実行前に認証状態を生成して保存する
 */
setup('認証状態の保存', async () => {
  // 環境変数の確認
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY 環境変数が設定されていません。\n' +
      'テスト用の認証状態を生成するために必要です。'
    );
  }

  // 新しいブラウザコンテキストを作成
  const browser = await chromium.launch();
  const context = await browser.newContext();

  try {
    // 認証状態を生成して保存
    await saveAuthenticatedState(
      context,
      'test@example.com',
      'test-password-123',
      'e2e/.auth/user.json'
    );
  } finally {
    await browser.close();
  }
});

