import Link from "next/link";
import { supabaseServer } from "../lib/supabaseServer";


export default async function RecipesPage () {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto p-6 space-y-4">
                <h1 className="text-2xl font-bold">保存したレシピ</h1>
                <p>閲覧にはログインが必要です。</p>
                <a className="px-3 py-2 rounded bg-black text-white inline-block" href="/auth/login">GitHubでログイン</a>
            </main>
        );
    }

    const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id,title,cook_time_min,created_at")
    .order("created_at",{ ascending: false });

    if (error) {
        return <main className="max-w-3xl mx-auto p-6">読み込みエラー：{error.message}</main>;
    }

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">保存したレシピ</h1>
                <nav className="flex gap-3">
                    <Link className="underline" href="/propose">提案へ</Link>
                    <a className="underline" href="/auth/logout">ログアウトへ</a>
                </nav>
            </header>

            <ul className="space-y-3">
                {(recipes ?? []).map(r => (
                    <li key={r.id} className="border rounded p-4 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{r.title}</div>
                            <div className="text-sm opacity-70">
                                {r.cook_time_min ?? "-"}分・{new Date(r.created_at).toLocaleString("ja-JP")}
                            </div>
                        </div>
                        <Link className="px-3 py-2 rounded border" href={`/recipes/${r.id}`}>詳細</Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}