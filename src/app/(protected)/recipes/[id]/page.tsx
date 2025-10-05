import { supabaseServer } from "@/app/lib/supabaseServer";
import { MainLayout } from "@/components/Main-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


type Ingredient = { name: string; qty?: string | number; unit?: string; optional?: boolean };

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: recipe, error } = await supabase
        .from("recipes")
        .select("id, title,cook_time_min, ingredients, steps, tools, created_at")
        .eq("id", id)
        .single();

    if (error || !recipe) {
        return (
            <MainLayout initialUser={user}>
                <div className="container px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">レシピが見つかりません</h1>
                    <Button asChild>
                        <Link href="/recipes">
                            <ArrowLeft className="mr-2 h-4 w-4"/>                        
                            レシピ一覧へ戻る
                        </Link>
                    </Button>
                </div>
            </MainLayout>
        )
    };

    return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">{recipe.title}</h1>
                <div className="text-sm opacity-70">
                    {recipe.cook_time_min ?? "-"}分・{new Date(recipe.created_at).toLocaleString("ja-JP")}
                </div>
            </div>
            <nav className="flex gap-3">
                <Link className="underline" href="/recipes">一覧</Link>
                <Link className="underline" href="/shopping">買い物リスト</Link>
            </nav>
        </header>

        <section>
            <h2 className="font-semibold mb-2">材料</h2>
            <ul className="list-disc pl-5">
                {(recipe.ingredients ?? []).map((it: Ingredient, i: number) => (
                    <li key={i}>{it.name} {it.qty}{it.unit}{it.optional ? "（任意）" : ""}</li>
                ))}
            </ul>
        </section>

        <section>
            <h2 className="font-semibold mb-2">手順</h2>
            <ol className="list-decimal pl-5 space-y-1">
                {(recipe.steps ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ol>
        </section>

        {recipe.tools?.length ? (
            <section>
                <h2 className="font-semibold mb-2">使用する調理器具</h2>
                <p className="opacity-80 text-sm">{recipe.tools.join("、")}</p>
            </section>
        ) : null}
    </main>
    );
}
