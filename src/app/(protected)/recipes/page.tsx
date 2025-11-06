import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabaseServer";
import { MainLayout } from "@/components/Main-layout";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Calendar, ChefHat } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default async function RecipesPage () {
    const supabase = await supabaseServer();

    const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id,title,description,cook_time_min,created_at")
    .order("created_at",{ ascending: false });

    if (error) {
        return <main className="max-w-3xl mx-auto p-6">読み込みエラー：{error.message}</main>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ja-JP", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
        });
    };

    return (
        <MainLayout>
            <div className="container px-4 py-8 max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">保存したレシピ</h1>
                        <p className="text-muted-foreground mt-2">
                            {recipes?.length}件のレシピが保存されています
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href="/recipes">
                            <Plus className="mr-2 h-4 w-4"/>新しいレシピを提案してもらう
                        </Link>
                    </Button>
                </div>

                {recipes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <Card key={recipe.id} className="group hover:shadow-lg transition-shadow">
                                <CardHeader className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{recipe.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-base line-clamp-2">{recipe.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4"/>{recipe.cook_time_min ?? "-"}分
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4"/>
                                        {formatDate(recipe.created_at)}
                                    </div>

                                    <Button asChild className="w-full">
                                        <Link href={`/recipes/${recipe.id}`}>レシピを見る</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-6">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                                <ChefHat className="h-12 w-12 text-muted-foreground"></ChefHat>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">レシピがありません</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    レシピ提案機能を使って、お気に入りのレシピを見つけて保存しましょう
                                </p>
                            </div>
                            <Button asChild size="lg">
                                <Link href="/propose">
                                    <Plus className="mr-2 h-5 w-5"/>レシピを提案してもらう
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
} 