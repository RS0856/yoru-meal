import { test, expect } from '@playwright/test';

test('LP表示: トップページの主要要素が表示される', async ({ page }) => {
  await page.goto('/');
  
  // ページタイトルを確認
  await expect(page).toHaveTitle(/YoruMeal/i);

  // Hero Sectionのタイトルを確認
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('今日の夕食');
  await expect(h1).toContainText('何にしよう？');

  // 機能説明カードが表示されることを確認（data-slot="card-title"で特定）
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: 'レシピ提案' })).toBeVisible();
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: '保存一覧' })).toBeVisible();
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: '買い物リスト' })).toBeVisible();
  
  // 使い方セクションが表示されることを確認
  await expect(page.getByRole('heading', { name: /使い方/i })).toBeVisible();
  
  // ナビゲーションリンクが表示されることを確認
  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: '提案' })).toBeVisible();
  await expect(nav.getByRole('link', { name: '保存一覧' })).toBeVisible();
  await expect(nav.getByRole('link', { name: '買い物リスト' })).toBeVisible();
  
  // メインCTAボタンが表示されることを確認
  await expect(page.getByRole('link', { name: /レシピを提案してもらう/i })).toBeVisible();
});

