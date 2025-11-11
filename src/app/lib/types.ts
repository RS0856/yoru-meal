import { z } from "zod";
import { Ingredient as IngredientSchema, ShoppingItem as ShoppingItemSchema, OutputSchema, ItemCategory as ItemCategorySchema } from "./validators";

// zodスキーマから型を生成
export type Ingredient = z.infer<typeof IngredientSchema>;
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;
export type RecipeProposal = z.infer<typeof OutputSchema>;
export type ItemCategory = z.infer<typeof ItemCategorySchema>;

// その他の型定義
export type BudgetLevel = "low" | "medium" | "high";
export type GoalType = "時短" | "ボリューム重視" | "バランス重視" | "ヘルシー";

// 買い物リストページ用の拡張型（checked状態やレシピ情報を含む）
export interface ShoppingItemWithMetadata {
    id: string;
    name: string;
    qty: number;
    unit: string;
    category: string;
    checked: boolean;
    recipeTitles: string[];
}

// データベースから取得される買い物リストデータ
export interface ShoppingListData {
    recipe_id: string;
    recipe_title: string;
    items: ShoppingItemWithMetadata[];
}

