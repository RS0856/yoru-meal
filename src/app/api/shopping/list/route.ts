
import { supabaseServer } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

        // ユーザーの全ての買い物リストを取得
        const { data: shoppingLists, error: sErr } = await supabase
            .from("shopping_lists")
            .select("recipe_id, items")
            .eq("user_id", user.id);

        if (sErr) throw sErr;
        if (!shoppingLists || shoppingLists.length === 0) return NextResponse.json([]);

        // レシピIDのリストを取得
        const recipeIds = shoppingLists.map(sl => sl.recipe_id);
        
        // 対応するレシピ情報を取得
        const { data: recipes, error: rErr } = await supabase
            .from("recipes")
            .select("id, title")
            .eq("user_id", user.id)
            .in("id", recipeIds);

        if (rErr) throw rErr;

        // レシピ情報をマップに変換
        const recipeMap = new Map((recipes || []).map(r => [r.id, r.title]));

        // レスポンス形式を整形
        const result = shoppingLists.map((sl) => ({
            recipe_id: sl.recipe_id,
            recipe_title: recipeMap.get(sl.recipe_id) || "",
            items: sl.items || []
        }));

        return NextResponse.json(result);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "unknown error" }, { status: 500 });
    }
}

