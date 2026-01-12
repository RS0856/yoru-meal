import { MainLayout } from "@/components/Main-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, ShoppingCart, LogIn, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Ingredient } from "@/app/lib/types";
import { getDemoRecipeById } from "@/app/lib/demo-data";

export default async function DemoRecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const recipe = getDemoRecipeById(id);

    if (!recipe) {
        return (
            <MainLayout>
                <div className="container px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">レシピが見つかりません</h1>
                    <Button asChild>
                        <Link href="/demo-recipes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            レシピ一覧へ戻る
                        </Link>
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <MainLayout>
            <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
                {/* タイトル */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/demo-recipes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{recipe.title}</h1>
                    </div>
                </div>

                {/* レシピ概要 */}
                <Card>
                    <CardHeader>
                        <CardDescription className="text-base">{recipe.description}</CardDescription>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {recipe.cook_time_min}分
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(recipe.created_at)}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* 材料リスト */}
                    <div className="lg:col-span1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    材料
                                    {/* デモモードでは買い物リストボタンを無効化 */}
                                    <Button variant="outline" size="sm" disabled title="ログインすると利用できます">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        買い物リストに追加
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                            <span className="font-medium">{ingredient.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {ingredient.qty}
                                                {ingredient.unit}
                                            </span>
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
                        {recipe.tools && recipe.tools.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>使用する調理器具</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.tools.map((tool: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                                            >
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* デモモード説明 & ログインCTA */}
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-start gap-3 flex-1">
                                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium mb-1">デモモードで閲覧中</p>
                                    <p>ログインすると、レシピの保存や買い物リストの作成ができます。</p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="/login">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    ログインする
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
