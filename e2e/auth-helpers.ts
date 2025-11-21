import { Page, BrowserContext } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin APIを使用してテスト用の認証セッションを生成
 * この関数は、メールOTP認証をバイパスして直接セッションを作成
 * 
 * 注意: この関数を使用するには、SUPABASE_SERVICE_ROLE_KEY 環境変数が必要
 * テスト環境専用の機能。本番環境では使用しない。
 */
export async function createAuthenticatedSession(
  email: string = 'test@example.com',
  password: string = 'test-password-123'
): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY の環境変数が必要です'
    );
  }

  // Admin APIクライアントを作成
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // テスト用ユーザーが存在するか確認
  // getUserByEmailは存在しないため、listUsersで検索
  const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = usersList?.users.find((u) => u.email === email);

  let userId: string;

  if (existingUser) {
    // 既存ユーザーの場合
    userId = existingUser.id;
    
    // パスワード認証が有効な場合、そのまま使用
    // パスワードがない場合は、パスワードを設定
    try {
      const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && session.session) {
        return {
          accessToken: session.session.access_token,
          refreshToken: session.session.refresh_token,
          userId: userId,
        };
      }
    } catch {
      // パスワード認証が失敗した場合、パスワードを更新
    }

    // パスワードを更新
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) {
      throw new Error(`パスワード更新に失敗: ${updateError.message}`);
    }
  } else {
    // 新規ユーザーを作成
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認をスキップ
    });

    if (createError || !newUser.user) {
      throw new Error(`ユーザー作成に失敗: ${createError?.message || 'Unknown error'}`);
    }

    userId = newUser.user.id;
  }

  // パスワードでログインしてセッションを取得
  const { data: session, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !session.session) {
    throw new Error(`ログインに失敗: ${signInError?.message || 'Unknown error'}`);
  }

  return {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    userId: userId,
  };
}

/**
 * Playwrightのコンテキストに認証状態を設定
 * Supabase SSRの認証クッキーを設定
 */
export async function setAuthenticatedContext(
  context: BrowserContext,
  session: { accessToken: string; refreshToken: string }
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL の環境変数が必要です');
  }

  // Supabase SSRのクッキー名を生成
  // 形式: sb-<project-ref>-auth-token
  const url = new URL(supabaseUrl);
  const projectRef = url.hostname.split('.')[0]; // supabase.co の場合
  const cookieName = `sb-${projectRef}-auth-token`;

  // セッション情報をJSON形式でクッキーに設定
  const sessionData = {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1時間後
    expires_in: 3600,
    token_type: 'bearer',
    user: null, // ユーザー情報は必要に応じて設定
  };

  await context.addCookies([
    {
      name: cookieName,
      value: JSON.stringify(sessionData),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false, // ローカル開発環境
    },
  ]);
}

/**
 * 認証状態を保存してstorageStateファイルを作成
 * この関数は、認証セッションを生成し、storageStateとして保存
 */
export async function saveAuthenticatedState(
  context: BrowserContext,
  email: string = 'test@example.com',
  password: string = 'test-password-123',
  storageStatePath: string = 'e2e/.auth/user.json'
): Promise<void> {
  const session = await createAuthenticatedSession(email, password);
  await setAuthenticatedContext(context, session);
  await context.storageState({ path: storageStatePath });
}

/**
 * ログインページでメールアドレスを入力して送信
 * 実際の認証完了は行わない（メールOTPのため）
 */
export async function submitLoginForm(page: Page, email: string): Promise<void> {
  await page.goto('/login');

  // メールアドレスを入力
  await page.getByLabel('メールアドレス').fill(email);

  // 送信ボタンをクリック
  await page.getByRole('button', { name: /ログインリンクを送信/i }).click();

  // 成功メッセージが表示されるまで待機
  await page.waitForSelector('text=メールを送信しました', { timeout: 5000 });
}

/**
 * 認証済み状態を確認（ナビゲーションにユーザー情報が表示されるなど）
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  // ログインページにリダイレクトされないことを確認
  const url = page.url();
  if (url.includes('/login')) {
    throw new Error('認証に失敗しました。ログインページにリダイレクトされています。');
  }
  // 必要に応じて、認証後の状態を確認（実装に応じて）
}

