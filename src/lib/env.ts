/**
 * 環境変数の検証と取得を行うユーティリティ
 * Zodスキーマを使用して型安全に環境変数を検証・取得
 */

import { z } from 'zod';

/**
 * サーバーサイドのみで必要な環境変数のスキーマ
 */
const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEYは必須です'),
});

/**
 * クライアントサイドでも必要な環境変数のスキーマ
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URLは有効なURLである必要があります'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEYは必須です'),
  NEXT_PUBLIC_BASE_URL: z.string().url('NEXT_PUBLIC_BASE_URLは有効なURLである必要があります').default('http://localhost:3000'),
});

/**
 * 全環境変数のスキーマ（サーバーサイド用）
 */
const envSchema = serverEnvSchema.merge(publicEnvSchema);

/**
 * 環境変数の検証を行う
 * @param isServerSide サーバーサイドかどうか
 * @throws z.ZodError 必須環境変数が不足している場合、または形式が不正な場合
 */
export function validateEnvVars(isServerSide: boolean = true): void {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  };

  try {
    // クライアントサイドでも必要な環境変数を検証
    publicEnvSchema.parse(publicEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`);
      throw new Error(`
[環境変数エラー] クライアントサイドで必須の環境変数が設定されていません。

エラー詳細:
${missing.join('\n')}

設定方法:
1. ローカル開発環境の場合:
   - .env.local ファイルを作成し、上記の環境変数を設定してください
   - 例: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

2. 本番環境（Vercel）の場合:
   - Vercel Dashboard > Project Settings > Environment Variables で設定してください

詳細は README.md または docs/system-spec.md を参照してください。
      `.trim());
    }
    throw error;
  }

  // サーバーサイドの場合、サーバー専用の環境変数も検証
  if (isServerSide) {
    const serverEnv = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    try {
      serverEnvSchema.parse(serverEnv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missing = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`);
        throw new Error(`
[環境変数エラー] サーバーサイドで必須の環境変数が設定されていません。

エラー詳細:
${missing.join('\n')}

設定方法:
1. ローカル開発環境の場合:
   - .env.local ファイルを作成し、上記の環境変数を設定してください
   - 例: OPENAI_API_KEY=sk-...

2. 本番環境（Vercel）の場合:
   - Vercel Dashboard > Project Settings > Environment Variables で設定してください

詳細は README.md または docs/system-spec.md を参照してください。
        `.trim());
      }
      throw error;
    }
  }
}

/**
 * 環境変数を型安全に取得する（検証済みであることを前提）
 * この関数は、validateEnvVars()を呼び出した後に使用することを想定
 */
export function getEnv() {
  return envSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  });
}

/**
 * 環境変数を型安全に取得する（検証済みであることを前提）
 * 型推論のために、検証済みの環境変数をエクスポート
 */
export const env = {
  // サーバーサイドのみ
  get OPENAI_API_KEY() {
    return process.env.OPENAI_API_KEY!;
  },
  
  // クライアントサイドでも使用可能
  get NEXT_PUBLIC_SUPABASE_URL() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  },
  
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  },
  
  get NEXT_PUBLIC_BASE_URL() {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  },
} as const;

