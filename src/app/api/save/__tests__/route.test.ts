/**
 * @jest-environment @edge-runtime/jest-environment
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { OutputSchema } from '@/app/lib/validators';

// supabaseServerをモック
jest.mock('@/app/lib/supabaseServer', () => ({
  supabaseServer: jest.fn(),
}));

describe('/api/save', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Supabaseのモック
    const { supabaseServer } = require('@/app/lib/supabaseServer');
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };
    supabaseServer.mockResolvedValue(mockSupabase);

    // 認証のモック（デフォルトで未ログイン）
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  describe('正常系', () => {
    it('認証済みユーザーがレシピを保存', async () => {
      // 認証済みユーザーをモック
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      // レシピデータ
      const recipeData = {
        title: '鶏むねのねぎ塩レンジ蒸し',
        description: '電子レンジで簡単に作れるヘルシーな鶏むね肉料理',
        cook_time_min: 20,
        ingredients: [
          { name: '鶏むね肉', qty: 1, unit: '枚', optional: false },
          { name: '長ねぎ', qty: 0.5, unit: '本', optional: false },
        ],
        steps: ['鶏むねを薄めのそぎ切りにする'],
        tools: ['電子レンジ'],
        shopping_lists: [
          { name: '長ねぎ', qty: 1, unit: '本', category: '野菜' },
        ],
        notes: [],
      };

      // recipesテーブルのinsertをモック
      const mockRecipe = { id: 'recipe-123', ...recipeData };
      const mockRecipesInsert = jest.fn();
      const mockShoppingListsInsert = jest.fn();

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: mockRecipesInsert.mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockRecipe, error: null }),
              }),
            }),
          };
        }
        if (table === 'shopping_lists') {
          return {
            insert: mockShoppingListsInsert.mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      });

      const req = new NextRequest('http://localhost:3000/api/save', {
        method: 'POST',
        body: JSON.stringify(recipeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      // 正常なレスポンスが返ることを確認
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.recipe_id).toBe('recipe-123');

      // recipesテーブルへのinsertが正しいデータで呼ばれたことを確認
      expect(mockRecipesInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          title: recipeData.title,
          description: recipeData.description,
          cook_time_min: recipeData.cook_time_min,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          tools: recipeData.tools,
        })
      );

      // shopping_listsテーブルへのinsertが正しいデータで呼ばれたことを確認
      expect(mockShoppingListsInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          recipe_id: 'recipe-123',
          items: recipeData.shopping_lists,
        })
      );
    });
  });

  describe('異常系', () => {
    it('未ログインユーザーの場合、401エラーが返る', async () => {
      const recipeData = {
        title: 'テストレシピ',
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト手順'],
      };

      const req = new NextRequest('http://localhost:3000/api/save', {
        method: 'POST',
        body: JSON.stringify(recipeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('未ログイン');
    });

    it('不正なレシピデータの場合、422エラーが返る', async () => {
      // 認証済みユーザーをモック
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      // 不正なレシピデータ（OutputSchemaに準拠しない）
      const invalidRecipeData = {
        title: 'テストレシピ',
        cook_time_min: 50, // 45を超える（無効）
        ingredients: [], // 空配列（無効）
        steps: [],
      };

      const req = new NextRequest('http://localhost:3000/api/save', {
        method: 'POST',
        body: JSON.stringify(invalidRecipeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();


      expect(response.status).toBe(422);
      expect(data.error).toBe('レシピデータの検証に失敗');
      expect(data.issues).toBeDefined();
    });

    it('recipesテーブルの挿入が失敗した場合、500エラーが返る', async () => {
      // 認証済みユーザーをモック
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const recipeData = {
        title: 'テストレシピ',
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト手順'],
        shopping_lists: [],
      };

      // recipesテーブルのinsertがエラーを返すようにモック
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: null, 
                  error: new Error('Database error') 
                }),
              }),
            }),
          };
        }
        return {};
      });

      const req = new NextRequest('http://localhost:3000/api/save', {
        method: 'POST',
        body: JSON.stringify(recipeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });

    it('shopping_listsテーブルの挿入が失敗した場合、500エラーが返る', async () => {
      // 認証済みユーザーをモック
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const recipeData = {
        title: 'テストレシピ',
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト手順'],
        shopping_lists: [
          { name: 'テスト', qty: 1, unit: '個', category: '野菜' },
        ],
      };

      // recipesテーブルのinsertは成功、shopping_listsテーブルのinsertは失敗
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'recipes') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ 
                  data: { id: 'recipe-123' }, 
                  error: null 
                }),
              }),
            }),
          };
        }
        if (table === 'shopping_lists') {
          return {
            insert: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Shopping list insert failed') 
            }),
          };
        }
        return {};
      });

      const req = new NextRequest('http://localhost:3000/api/save', {
        method: 'POST',
        body: JSON.stringify(recipeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Shopping list insert failed');
    });
  });
});

