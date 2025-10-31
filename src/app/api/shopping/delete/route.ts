import { supabaseServer } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "未ログイン" }, { status: 401 });

        // ユーザーの全ての買い物リストを削除
        const { error } = await supabase
            .from("shopping_lists")
            .delete()
            .eq("user_id", user.id);

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "unknown error" }, { status: 500 });
    }
}
