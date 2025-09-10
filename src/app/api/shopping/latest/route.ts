
import { supabaseServer } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

        const { data: r, error: rErr } = await supabase
        .from("recipes")
        .select("id,title,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

        if (rErr) throw rErr;
        if (!r) return NextResponse.json(null);

        const { data: s, error: sErr } = await supabase
        .from("shopping_lists")
        .select("items")
        .eq("user_id",user.id)
        .eq("recipe_id",r.id)
        .maybeSingle();

        if (sErr) throw sErr;
        if (!s) return NextResponse.json(null);

        return NextResponse.json({ recipe_id: r.id, recipe_title: r.title, items: s.items });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
    }
}