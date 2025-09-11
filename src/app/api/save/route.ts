import { supabaseServer } from "@/app/lib/supabaseServer";
import { OutputSchema } from "@/app/lib/validators";
import { NextRequest, NextResponse } from "next/server";

// TODO：本番はServer-sideの認証（Server Components or RLS + supabase-auth-helpers）
export async function POST(req: NextRequest) {
    try {
        const supabase = await supabaseServer();
        const { data: { user }} = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

        const body = await req.json();
        const parsed = OutputSchema.parse(body);

        const { data: recipe, error: rErr } = await supabase.from("recipes").insert({
            user_id: user.id,
            title: parsed.title,
            ingredients: parsed.ingredients,
            steps: parsed.steps,
            cook_time_min: parsed.cook_time_min,
            tools: parsed.tools,
            constraints: { no_vinegar: true }
        })
        .select()
        .single();

        if (rErr) throw rErr;

        const { error: sErr } = await supabase.from("shopping_lists").insert({
            user_id: user.id,
            recipe_id: recipe.id,
            items: parsed.shopping_lists
        });

        if (sErr) throw sErr;

        return NextResponse.json({ ok: true, recipe_id: recipe.id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
    }
}