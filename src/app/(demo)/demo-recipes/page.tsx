import Link from "next/link";
import { MainLayout } from "@/components/Main-layout";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DEMO_RECIPES } from "@/app/lib/demo-data";

export default function DemoRecipesPage() {
    const recipes = DEMO_RECIPES;

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
            <div className="container px-4 py-8 max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">保存したレシピ</h1>
                        <p className="text-muted-foreground mt-2">{recipes.length}件のサンプルレシピを表示中（デモ）</p>
                    </div>
                    <Button asChild size="sm">
                        <Link href="/demo-propose">
                            <Plus className="mr-2 h-4 w-4" />
                            新しいレシピを提案してもらう
                        </Link>
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <Card key={recipe.id} className="group hover:shadow-lg transition-shadow">
                            <CardHeader className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {recipe.title}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-base line-clamp-2">{recipe.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {recipe.cook_time_min ?? "-"}分
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(recipe.created_at)}
                                </div>

                                <Button asChild className="w-full">
                                    <Link href={`/demo-recipes/${recipe.id}`}>レシピを見る</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
