import { OutputSchema, Ingredient, ShoppingItem, ItemCategory } from '../validators';

describe('validators', () => {
  describe('ItemCategory', () => {
    it('有効なカテゴリ値がパスする', () => {
      const validCategory = ['肉', '魚', '野菜', '調味料', 'その他'] as const;
      validCategory.forEach((category) => {
        expect(() => ItemCategory.parse(category)).not.toThrow();
      })
    });

    it('無効なカテゴリ値がエラーになる', () => {
      expect(() => ItemCategory.parse('果物')).toThrow();
      expect(() => ItemCategory.parse('飲み物')).toThrow();
    });
  });

  describe('Ingredient', () => {
    it('有効な材料データがパスする', () => {
      const validIngredient = {
        name: '鶏むね肉',
        qty: 1,
        unit: '枚',
        optional: false,
      };
      expect(() => Ingredient.parse(validIngredient)).not.toThrow();
    });

    it('qtyが負の数でエラーになる', () => {
      const invalidIngredient = {
        name: '鶏むね肉',
        qty: -1,
        unit: '枚',
      };
      expect(() => Ingredient.parse(invalidIngredient)).toThrow();
    });

    it('optionalが未指定時はデフォルトでfalseになる', () => {
      const ingredient = {
        name: '鶏むね肉',
        qty: 1,
        unit: '枚',
      };
      const parsed = Ingredient.parse(ingredient);
      expect(parsed.optional).toBe(false);
    });
  });

  describe('ShoppingItem', () => {
    it('有効な買い物アイテムデータがパスする', () => {
      const validItem = {
        name: '長ねぎ',
        qty: 1,
        unit: '本',
        category: '野菜' as const,
      };
      expect(() => ShoppingItem.parse(validItem)).not.toThrow();
    });

    it('categoryがオプショナルでパスする', () => {
      const itemWithoutCategory = {
        name: '長ねぎ',
        qty: 1,
        unit: '本',
      };
      expect(() => ShoppingItem.parse(itemWithoutCategory)).not.toThrow();
    });

    it('categoryがenum値でパスする', () => {
      const categories = ['肉', '魚', '野菜', '調味料', 'その他'] as const;
      categories.forEach((category) => {
        const item = {
          name: 'テスト',
          qty: 1,
          unit: '個',
          category,
        };
        expect(() => ShoppingItem.parse(item)).not.toThrow();
      });
    });
  });

  describe('OutputSchema', () => {
    it('有効なレシピデータがパスする', () => {
      const validRecipe = {
        title: '鶏むねのねぎ塩レンジ蒸し',
        description: '電子レンジで簡単に作れるヘルシーな鶏むね肉料理',
        cook_time_min: 20,
        ingredients: [
          { name: '鶏むね肉', qty: 1, unit: '枚', optional: false },
        ],
        steps: ['鶏むねを薄めのそぎ切りにする'],
        tools: ['電子レンジ'],
        shopping_lists: [],
        notes: [],
      };
      expect(() => OutputSchema.parse(validRecipe)).not.toThrow();
    });

    it('cook_time_minが45を超えるとエラーになる', () => {
      const invalidRecipe = {
        title: 'テストレシピ',
        cook_time_min: 46,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト'],
      };
      expect(() => OutputSchema.parse(invalidRecipe)).toThrow();
    });

    it('cook_time_minが45以下ならパスする', () => {
      const validRecipe = {
        title: 'テストレシピ',
        cook_time_min: 45,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト'],
      };
      expect(() => OutputSchema.parse(validRecipe)).not.toThrow();
    });

    it('descriptionが200文字を超えるとエラーになる', () => {
      const invalidRecipe = {
        title: 'テストレシピ',
        description: 'あ'.repeat(201), // 201文字
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト'],
      };
      expect(() => OutputSchema.parse(invalidRecipe)).toThrow();
    });

    it('descriptionが200文字以下ならパスする', () => {
      const validRecipe = {
        title: 'テストレシピ',
        description: 'あ'.repeat(200), // 200文字
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: ['テスト'],
      };
      expect(() => OutputSchema.parse(validRecipe)).not.toThrow();
    });

    it('ingredientsが空配列だとエラーになる', () => {
      const invalidRecipe = {
        title: 'テストレシピ',
        cook_time_min: 30,
        ingredients: [],
        steps: ['テスト'],
      };
      expect(() => OutputSchema.parse(invalidRecipe)).toThrow();
    });

    it('stepsが空配列だとエラーになる', () => {
      const invalidRecipe = {
        title: 'テストレシピ',
        cook_time_min: 30,
        ingredients: [{ name: 'テスト', qty: 1, unit: '個' }],
        steps: [],
      };
      expect(() => OutputSchema.parse(invalidRecipe)).toThrow();
    });
  });
});

