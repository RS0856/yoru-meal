import { supabaseServer } from "@/app/lib/supabaseServer";
import { MainLayout } from "@/components/Main-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


type Ingredient = { name: string; qty?: string | number; unit?: string; optional?: boolean };

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await supabaseServer();

    const { data: recipe, error } = await supabase
        .from("recipes")
        .select("id, title,cook_time_min, ingredients, steps, tools, created_at")
        .eq("id", id)
        .single();

    if (error || !recipe) {
        return (
            <MainLayout>
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
    <MainLayout>
        <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
            {/* タイトル */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/recipes">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{recipe.title}</h1>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 材料リスト */}
                <div className="lg:col-span1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                材料
                                <Button>
                                    {/* TODO: 買い物リストへのリンク追加 */}
                                    <ShoppingCart className="mr-2 h-4 w-4"/>
                                    買い物リスト
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-medium">{ingredient.name}</span>
                                        <span className="text-sm text-muted-foreground">{ingredient.qty}{ingredient.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 作り方 */}
                <div className="lg:col-span2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>作り方</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {recipe.steps.map((step: string, index: number) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-base leading-relaxed pt-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>

                    {/* 使用する調理器具 */}
                    <div className="space-y-6">
                        {recipe.tools && recipe.tools.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>使用する調理器具</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.tools.map((tool: string, index: number) => (
                                            <span key={index} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
    );
}
