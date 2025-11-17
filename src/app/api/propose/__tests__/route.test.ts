/**
 * @jest-environment @edge-runtime/jest-environment
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { OutputSchema } from '@/app/lib/validators';

// OpenAIモジュールをモック
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

// supabaseServerをモック
jest.mock('@/app/lib/supabaseServer', () => ({
  supabaseServer: jest.fn(),
}));

describe('/api/propose', () => {
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

    // レート制限のモック（デフォルトで通過）
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    // 認証のモック（デフォルトで未ログイン）
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  describe('正常系', () => {
    it('有効な入力でレシピが返る', async () => {
      // 有効なレシピレスポンスをモック
      const mockRecipeResponse = {
        title: '鶏むねのねぎ塩レンジ蒸し',
        description: '電子レンジで簡単に作れるヘルシーな鶏むね肉料理',
        cook_time_min: 20,
        ingredients: [
          { name: '鶏むね肉', qty: 1, unit: '枚', optional: false },
          { name: '長ねぎ', qty: 0.5, unit: '本', optional: false },
          { name: 'ごま油', qty: 1, unit: '大さじ', optional: false },
        ],
        steps: [
          '鶏むねを薄めのそぎ切りにする',
          '耐熱皿にのせて塩こしょう、ねぎ、ごま油をかけラップ',
          '電子レンジ600Wで4〜5分加熱して全体を混ぜる',
        ],
        tools: ['電子レンジ', 'まな板', '包丁'],
        shopping_lists: [
          { name: '長ねぎ', qty: 1, unit: '本', category: '野菜' },
        ],
        notes: ['加熱後に余熱で火入れ'],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
      });

      // リクエストを作成
      const requestBody = {
        exclude_ingredients: [],
        available_tools: ['電子レンジ', 'フライパン'],
        servings: 1,
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      // レスポンスが OutputSchema に準拠していることを検証
      const parseResult = OutputSchema.safeParse(data);
      if (!parseResult.success) {
        console.error('OutputSchema validation failed:', parseResult.error.flatten());
        console.error('Response data:', JSON.stringify(data, null, 2));
      }
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.title).toBe('鶏むねのねぎ塩レンジ蒸し');
        expect(parseResult.data.cook_time_min).toBe(20);
        expect(parseResult.data.ingredients).toHaveLength(3);
        expect(parseResult.data.steps).toHaveLength(3);
      }

      // OpenAI APIが正しく呼ばれたことを検証
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          temperature: 0.7,
          response_format: { type: 'json_object' },
        })
      );

      // レスポンスステータスが200であることを検証
      expect(response.status).toBe(200);
    });

    it('exclude_ingredientsが材料に含まれない', async () => {
      // 除外食材「酢」を含まないレシピレスポンスをモック
      const mockRecipeResponse = {
        title: '鶏むねのねぎ塩レンジ蒸し',
        description: '電子レンジで簡単に作れるヘルシーな鶏むね肉料理',
        cook_time_min: 20,
        ingredients: [
          { name: '鶏むね肉', qty: 1, unit: '枚', optional: false },
          { name: '長ねぎ', qty: 0.5, unit: '本', optional: false },
          { name: 'ごま油', qty: 1, unit: '大さじ', optional: false },
          // 酢は含まれていない
        ],
        steps: [
          '鶏むねを薄めのそぎ切りにする',
          '耐熱皿にのせて塩こしょう、ねぎ、ごま油をかけラップ',
          '電子レンジ600Wで4〜5分加熱して全体を混ぜる',
        ],
        tools: ['電子レンジ', 'まな板', '包丁'],
        shopping_lists: [
          { name: '長ねぎ', qty: 1, unit: '本', category: '野菜' },
          // 酢は含まれていない
        ],
        notes: [],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
      });

      // 除外食材に「酢」を指定
      const requestBody = {
        exclude_ingredients: ['酢'],
        available_tools: ['電子レンジ', 'フライパン'],
        servings: 1,
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      // レスポンスが OutputSchema に準拠していることを検証
      const parseResult = OutputSchema.safeParse(data);
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        // 材料に「酢」が含まれていないことを検証
        const ingredientNames = parseResult.data.ingredients.map((ing) => ing.name);
        const shoppingListNames = parseResult.data.shopping_lists.map((item) => item.name);
        const allNames = [...ingredientNames, ...shoppingListNames];

        expect(allNames.some((name) => name.includes('酢'))).toBe(false);
        expect(allNames.some((name) => name.includes('米酢'))).toBe(false);
        expect(allNames.some((name) => name.includes('りんご酢'))).toBe(false);
        expect(allNames.some((name) => name.includes('ワインビネガー'))).toBe(false);
      }

      // レスポンスステータスが200であることを検証
      expect(response.status).toBe(200);
    });

    it('ログインユーザーの場合、履歴を取得してシステムプロンプトに含める', async () => {
      // ログインユーザーをモック
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      // 履歴取得のモック
      const mockRecipes = [
        { title: '過去のレシピ1' },
        { title: '過去のレシピ2' },
      ];
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'api_rate_limit') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  gte: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'recipes') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: mockRecipes, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const mockRecipeResponse = {
        title: '新しいレシピ',
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト手順'],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
      });

      const requestBody = {
        exclude_ingredients: [],
        available_tools: [],
        servings: 1,
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      // レスポンスが正常であることを検証
      expect(response.status).toBe(200);
      expect(data.title).toBe('新しいレシピ');

      // システムプロンプトに履歴が含まれていることを検証
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('過去のレシピ1'),
            }),
          ]),
        })
      );
    });
  });

  describe('異常系', () => {
    it('レート制限を超えた場合、429エラーが返る', async () => {
      // レート制限を超えた状態をモック（5件以上のデータを返す）
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ 
                data: [
                  { id: '1', at: new Date().toISOString() },
                  { id: '2', at: new Date().toISOString() },
                  { id: '3', at: new Date().toISOString() },
                  { id: '4', at: new Date().toISOString() },
                  { id: '5', at: new Date().toISOString() },
                ], 
                error: null 
              }),
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const requestBody = {
        exclude_ingredients: [],
        available_tools: [],
        servings: 1,
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();
      expect(response.status).toBe(429);
      expect(data.error).toBe('しばらくしてから再試行してください');
    });

    it('入力バリデーションエラーの場合、422エラーが返る', async () => {
      // 無効なデータを送信（servingsが負の数）
      const requestBody = {
        exclude_ingredients: [],
        available_tools: [],
        servings: -1, // 無効な値
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toBe('入力バリデーションエラー');
      expect(data.issues).toBeDefined();
    });

    it('LLM出力が不正JSON（再試行で成功）', async () => {
      // 1回目のLLM呼び出し：不正なJSONを返す（OutputSchemaに準拠しない）
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'テストレシピ',
                cook_time_min: 50, // 45を超える（無効）
                ingredients: [], // 空配列（無効）
                steps: [],
              }),
            },
          },
        ],
      });

      // 2回目のLLM呼び出し（再試行）：正常なJSONを返す
      const mockRecipeResponse = {
        title: '鶏むねのねぎ塩レンジ蒸し',
        description: '電子レンジで簡単に作れるヘルシーな鶏むね肉料理',
        cook_time_min: 20,
        ingredients: [
          { name: '鶏むね肉', qty: 1, unit: '枚', optional: false },
          { name: '長ねぎ', qty: 0.5, unit: '本', optional: false },
        ],
        steps: ['鶏むねを薄めのそぎ切りにする'],
        tools: ['電子レンジ'],
        shopping_lists: [],
        notes: [],
      };

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify(mockRecipeResponse),
            },
          },
        ],
      });

      const requestBody = {
        exclude_ingredients: [],
        available_tools: ['電子レンジ'],
        servings: 1,
        goals: ['時短'],
        budget_level: 'low',
        locale: 'JP',
      };

      const req = new NextRequest('http://localhost:3000/api/propose', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      // 正常なレスポンスが返ることを確認
      expect(response.status).toBe(200);
      expect(data.title).toBe('鶏むねのねぎ塩レンジ蒸し');
      expect(data.cook_time_min).toBe(20);

      // OutputSchemaに準拠していることを確認
      const parseResult = OutputSchema.safeParse(data);
      expect(parseResult.success).toBe(true);

      // LLM APIが2回呼ばれたことを確認（1回目：失敗、2回目：成功）
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
  });
});

