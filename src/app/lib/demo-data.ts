import { RecipeProposal, ShoppingItemWithMetadata } from "./types";

// デモ用レシピデータ（DBの形式に合わせてid, created_atを追加）
export interface DemoRecipe extends RecipeProposal {
    id: string;
    created_at: string;
}

export const DEMO_RECIPES: DemoRecipe[] = [
    {
        id: "demo-recipe-1",
        title: "鶏むね肉の塩レモン炒め",
        description: "さっぱりとしたレモンの風味が食欲をそそる、ヘルシーな時短メニュー",
        cook_time_min: 20,
        ingredients: [
            { name: "鶏むね肉", qty: 200, unit: "g", optional: false },
            { name: "レモン汁", qty: 2, unit: "大さじ", optional: false },
            { name: "塩", qty: 1, unit: "小さじ", optional: false },
            { name: "オリーブオイル", qty: 1, unit: "大さじ", optional: false },
            { name: "にんにく", qty: 1, unit: "片", optional: false },
            { name: "黒こしょう", qty: 1, unit: "少々", optional: true },
        ],
        steps: [
            "鶏むね肉を一口大のそぎ切りにし、塩・黒こしょうで下味をつける",
            "にんにくをみじん切りにする",
            "フライパンにオリーブオイルを熱し、にんにくを香りが出るまで炒める",
            "鶏肉を加え、中火で両面に焼き色がつくまで焼く",
            "レモン汁を加えて全体に絡め、火を止める",
        ],
        tools: ["フライパン"],
        shopping_lists: [
            { name: "鶏むね肉", qty: 200, unit: "g", category: "肉" },
            { name: "レモン", qty: 1, unit: "個", category: "野菜" },
            { name: "にんにく", qty: 1, unit: "片", category: "野菜" },
        ],
        notes: ["レモン汁は市販のものでもOK"],
        created_at: "2024-12-01T18:00:00Z",
    },
    {
        id: "demo-recipe-2",
        title: "豚バラと白菜のレンジ蒸し",
        description: "電子レンジで簡単に作れる、野菜たっぷりのボリュームおかず",
        cook_time_min: 15,
        ingredients: [
            { name: "豚バラ薄切り肉", qty: 150, unit: "g", optional: false },
            { name: "白菜", qty: 200, unit: "g", optional: false },
            { name: "ポン酢", qty: 3, unit: "大さじ", optional: false },
            { name: "ごま油", qty: 1, unit: "小さじ", optional: false },
            { name: "白ごま", qty: 1, unit: "大さじ", optional: true },
        ],
        steps: [
            "白菜を食べやすい大きさに切る",
            "耐熱皿に白菜と豚バラ肉を交互に重ねる",
            "ふんわりラップをかけ、電子レンジ600Wで6分加熱する",
            "ポン酢とごま油を混ぜ合わせ、仕上げにかける",
            "お好みで白ごまを散らして完成",
        ],
        tools: ["電子レンジ"],
        shopping_lists: [
            { name: "豚バラ薄切り肉", qty: 150, unit: "g", category: "肉" },
            { name: "白菜", qty: 200, unit: "g", category: "野菜" },
        ],
        notes: ["ラップはふんわりかけることで蒸気を逃がす"],
        created_at: "2024-11-28T19:30:00Z",
    },
    {
        id: "demo-recipe-3",
        title: "鮭のホイル焼き",
        description: "トースターで手軽に作れる、ふっくらジューシーな魚料理",
        cook_time_min: 25,
        ingredients: [
            { name: "生鮭", qty: 1, unit: "切れ", optional: false },
            { name: "玉ねぎ", qty: 0.5, unit: "個", optional: false },
            { name: "しめじ", qty: 50, unit: "g", optional: false },
            { name: "バター", qty: 10, unit: "g", optional: false },
            { name: "塩", qty: 1, unit: "少々", optional: false },
            { name: "こしょう", qty: 1, unit: "少々", optional: false },
            { name: "醤油", qty: 1, unit: "小さじ", optional: true },
        ],
        steps: [
            "鮭に塩・こしょうをふる",
            "玉ねぎを薄切り、しめじは石づきを取ってほぐす",
            "アルミホイルの上に玉ねぎを敷き、その上に鮭を置く",
            "しめじとバターをのせ、ホイルで包む",
            "トースターで15〜20分焼き、お好みで醤油をかける",
        ],
        tools: ["トースター"],
        shopping_lists: [
            { name: "生鮭", qty: 1, unit: "切れ", category: "魚" },
            { name: "玉ねぎ", qty: 1, unit: "個", category: "野菜" },
            { name: "しめじ", qty: 1, unit: "パック", category: "野菜" },
            { name: "バター", qty: 10, unit: "g", category: "調味料" },
        ],
        notes: ["ホイルはしっかり閉じて蒸気を逃さないようにする"],
        created_at: "2024-11-25T18:45:00Z",
    },
];

// デモ用買い物リストデータ（レシピ1と2の材料を統合したサンプル）
export const DEMO_SHOPPING_LIST: ShoppingItemWithMetadata[] = [
    {
        id: "demo-item-1",
        name: "鶏むね肉",
        qty: 200,
        unit: "g",
        category: "肉",
        checked: false,
        recipeTitles: ["鶏むね肉の塩レモン炒め"],
    },
    {
        id: "demo-item-2",
        name: "豚バラ薄切り肉",
        qty: 150,
        unit: "g",
        category: "肉",
        checked: false,
        recipeTitles: ["豚バラと白菜のレンジ蒸し"],
    },
    {
        id: "demo-item-3",
        name: "レモン",
        qty: 1,
        unit: "個",
        category: "野菜",
        checked: false,
        recipeTitles: ["鶏むね肉の塩レモン炒め"],
    },
    {
        id: "demo-item-4",
        name: "にんにく",
        qty: 1,
        unit: "片",
        category: "野菜",
        checked: false,
        recipeTitles: ["鶏むね肉の塩レモン炒め"],
    },
    {
        id: "demo-item-5",
        name: "白菜",
        qty: 200,
        unit: "g",
        category: "野菜",
        checked: false,
        recipeTitles: ["豚バラと白菜のレンジ蒸し"],
    },
];

// デモ提案ページ用の固定レシピ（AI提案の代わりに表示）
export const DEMO_PROPOSED_RECIPE: DemoRecipe = DEMO_RECIPES[0];

// デモレシピをIDで検索するヘルパー関数
export function getDemoRecipeById(id: string): DemoRecipe | undefined {
    return DEMO_RECIPES.find((recipe) => recipe.id === id);
}
