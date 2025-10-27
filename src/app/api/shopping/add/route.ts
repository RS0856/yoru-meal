import { supabaseServer } from "@/app/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

        const body = await req.json();
        const { recipe_id, ingredients } = body;

        if (!recipe_id || !ingredients) {
            return NextResponse.json({ error: "recipe_idとingredientsが必要です" }, { status: 400 });
        }

        // レシピが存在し、ユーザーが所有しているかチェック
        const { data: recipe, error: recipeError } = await supabase
            .from("recipes")
            .select("id, user_id")
            .eq("id", recipe_id)
            .eq("user_id", user.id)
            .single();

        if (recipeError || !recipe) {
            return NextResponse.json({ error: "レシピが見つかりません" }, { status: 404 });
        }

        // 既存の買い物リストを削除（上書き）
        await supabase
            .from("shopping_lists")
            .delete()
            .eq("user_id", user.id)
            .eq("recipe_id", recipe_id);

        // 新しい買い物リストを作成
        const shoppingItems = ingredients.map((ingredient: { name: string; qty?: number; unit?: string }) => ({
            name: ingredient.name,
            qty: ingredient.qty || 1,
            unit: ingredient.unit || "",
            category: "その他", // デフォルトカテゴリ
            checked: false
        }));

        const { error: insertError } = await supabase
            .from("shopping_lists")
            .insert({
                user_id: user.id,
                recipe_id: recipe_id,
                items: shoppingItems
            });

        if (insertError) throw insertError;

        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "unknown error" }, { status: 500 });
    }
}
