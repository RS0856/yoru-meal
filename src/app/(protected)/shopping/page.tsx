"use client";

import { MainLayout } from "@/components/Main-layout";
import { ShoppingCart, Plus, Trash2, Check } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ShoppingItem {
    id: string
    name: string
    amount: string
    category: string
    checked: boolean
    recipeTitle: string
}

// Mock shopping list data
const initialShoppingList: ShoppingItem[] = [
    { id: "1", name: "鶏もも肉", amount: "300g", category: "肉類", checked: false, recipeTitle: "鶏肉と野菜の照り焼き" },
    { id: "2", name: "ピーマン", amount: "2個", category: "野菜", checked: false, recipeTitle: "鶏肉と野菜の照り焼き" },
    { id: "3", name: "玉ねぎ", amount: "1/2個", category: "野菜", checked: true, recipeTitle: "鶏肉と野菜の照り焼き" },
    { id: "4", name: "にんじん", amount: "1/3本", category: "野菜", checked: false, recipeTitle: "鶏肉と野菜の照り焼き" },
    {
      id: "5",
      name: "しょうゆ",
      amount: "大さじ2",
      category: "調味料",
      checked: true,
      recipeTitle: "鶏肉と野菜の照り焼き",
    },
    {
      id: "6",
      name: "みりん",
      amount: "大さじ2",
      category: "調味料",
      checked: false,
      recipeTitle: "鶏肉と野菜の照り焼き",
    },
    { id: "7", name: "砂糖", amount: "大さじ1", category: "調味料", checked: true, recipeTitle: "鶏肉と野菜の照り焼き" },
    {
      id: "8",
      name: "サラダ油",
      amount: "大さじ1",
      category: "調味料",
      checked: false,
      recipeTitle: "鶏肉と野菜の照り焼き",
    },
  ]

const categories = ["肉","魚","野菜","調味料","その他"];
const categoryColors: { [key: string]: string } = {
    肉: "bg-red-100 text-red-800",
    魚: "bg-blue-100 text-blue-800",
    野菜: "bg-green-100 text-green-800",
    調味料: "bg-yellow-100 text-yellow-800",
    その他: "bg-gray-100 text-gray-800",
}

export default function ShoppingPage({ initialUser }: { initialUser: User | null }) {
    const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(initialShoppingList);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const toggleItem = (id: string) => {
        setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }

    const removeItem = (id: string) => {
        setShoppingList(prev => prev.filter(item => item.id !== id));
    }

    const filteredList = 
        selectedCategory === "all" ? shoppingList : shoppingList.filter((item) => item.category === selectedCategory);
    const totalItems = shoppingList.length;
    const completedItems = shoppingList.filter((item) => item.checked).length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const groupedItems = categories.reduce(
        (acc, category) => {
            acc[category] = filteredList.filter((item) => item.category === category)
            return acc
        },
        {} as { [key: string]: ShoppingItem[] },
    )

    return (
        <MainLayout initialUser={initialUser}>
            <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
                {/* ヘッダー */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <ShoppingCart className="h-8 w-8"/>買い物リスト
                            </h1>
                            <p className="text-muted-foreground mt-2">レシピから作成された買い物リストです</p>
                        </div>
                        <Button asChild>
                            <Link href="/propose">
                                <Plus className="mr-2 h-4 w-4"/>新しいレシピを提案
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">進捗状況</CardTitle>
                                <Badge variant="outline">
                                    {completedItems} / {totalItems}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Progress value={progress} className="h-2" />
                                <p className="text-sm text-muted-foreground">
                                    {completedItems}個完了 / 全{totalItems}個
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* カテゴリフィルタ */}
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={selectedCategory === "all" ? "default" : "outline"} size="sm" 
                        onClick={() => setSelectedCategory("all")}>全て
                    </Button>
                    {categories.map((category) => {
                        const categoryItems = shoppingList.filter((item) => item.category === category);
                        if (categoryItems.length === 0) return null;

                        return (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category} ({categoryItems.length})
                            </Button>
                        )
                    })}
                </div>

                {/* 買い物リスト */}
                {totalItems > 0 ? (
                    <div className="space-y-6">
                        {categories.map((category) => {
                            const categoryItems = groupedItems[category]
                            if (categoryItems.length === 0) return null

                            return (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge className={categoryColors[category]}>{category}</Badge>
                                            <span className="text-sm text-muted-foreground">({categoryItems.length})個</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {categoryItems.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${item.checked ? "bg-muted/50 border-muted" : "bg-background hover:bg-muted/30"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        id={item.id}
                                                        checked={item.checked}
                                                        onCheckedChange={() => toggleItem(item.id)}
                                                        className="h-5 w-5" 
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                                                                {item.name}
                                                            </span>
                                                            <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                                                                {item.amount}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">{item.recipeTitle}</p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => removeItem(item.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-6">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground"/>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">買い物リストが空です</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    レシピ詳細ページから買い物リストを作成するか、新しいレシピを提案してもらいましょう
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild>
                                    <Link href="/propose">
                                        レシピを提案してもらう
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/recipes">保存したレシピを見る</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {/* サマリ */}
                {totalItems > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Check className="h-5 w-5"/>お買い物完了
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">すべてのアイテムをチェックしたら、お買い物完了です！</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="flex-1" disabled={completedItems !== totalItems}>
                                        <Check className="h-4 w-4 mr-2"/>買い物完了
                                    </Button>
                                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                                        <Link href="/recipes">レシピを確認する</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
} 