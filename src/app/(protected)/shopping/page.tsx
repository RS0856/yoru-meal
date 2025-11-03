"use client";

import { MainLayout } from "@/components/Main-layout";
import { ShoppingCart, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ShoppingItem {
    id: string
    name: string
    qty: number
    unit: string
    category: string
    checked: boolean
    recipeTitles: string[]
}

interface ShoppingListData {
    recipe_id: string
    recipe_title: string
    items: ShoppingItem[]
}


const categories = ["肉","魚","野菜","調味料","その他"];
const categoryColors: { [key: string]: string } = {
    肉: "bg-red-100 text-red-800",
    魚: "bg-blue-100 text-blue-800",
    野菜: "bg-green-100 text-green-800",
    調味料: "bg-yellow-100 text-yellow-800",
    その他: "bg-gray-100 text-gray-800",
}

export default function ShoppingPage() {
    const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleItem = (id: string) => {
        setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }

    const removeItem = (id: string) => {
        setShoppingList(prev => prev.filter(item => item.id !== id));
    }

    const handleComplete = async () => {
        // データベースから買い物リストを即座に削除
        try {
            const response = await fetch("/api/shopping/delete", {
                method: "DELETE",
            });
            if (!response.ok) {
                console.error("買い物リストの削除に失敗しました");
                alert("買い物リストの削除に失敗しました");
                return;
            }
        } catch (err) {
            console.error("買い物リスト削除エラー:", err);
            alert("買い物リストの削除に失敗しました");
            return;
        }

        // 表示上リストを空にする
        setShoppingList([]);
        setIsCompleted(true);

        // 完了メッセージを5秒後に自動で閉じる
        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        messageTimerRef.current = setTimeout(() => {
            setIsCompleted(false);
            messageTimerRef.current = null;
        }, 5000);
    }

    // アンマウント時のクリーンアップ
    useEffect(() => {
        return () => {
            if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        };
    }, []);

    // データ取得
    useEffect(() => {
        const fetchShoppingList = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch("/api/shopping/list");
                
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("ログインが必要です");
                    }
                    throw new Error("買い物リストの取得に失敗しました");
                }
                
                const data: ShoppingListData[] = await response.json();
                
                if (data && data.length > 0) {
                    // すべての買い物リストのアイテムを統合
                    // 同じ食材名・単位のアイテムは統合し、レシピ名を集約
                    const itemsMap = new Map<string, ShoppingItem>();
                    
                    data.forEach((list) => {
                        list.items.forEach((item, index) => {
                            // 食材名 + 単位をキーとして使用（qtyは統合時に合計）
                            const key = `${item.name}-${item.unit}`;
                            
                            if (itemsMap.has(key)) {
                                // 既存のアイテムに統合
                                const existing = itemsMap.get(key)!;
                                existing.qty += item.qty || 0;
                                // レシピ名がまだ含まれていない場合のみ追加
                                if (!existing.recipeTitles.includes(list.recipe_title)) {
                                    existing.recipeTitles.push(list.recipe_title);
                                }
                            } else {
                                // 新規アイテム
                                itemsMap.set(key, {
                                    id: `${list.recipe_id}-${index}`,
                                    name: item.name,
                                    qty: item.qty || 0,
                                    unit: item.unit,
                                    category: item.category,
                                    checked: item.checked || false,
                                    recipeTitles: [list.recipe_title]
                                });
                            }
                        });
                    });
                    
                    const allItems = Array.from(itemsMap.values());
                    setShoppingList(allItems);
                } else {
                    setShoppingList([]);
                }
            } catch (err) {
                console.error("買い物リスト取得エラー:", err);
                setError(err instanceof Error ? err.message : "買い物リストの取得に失敗しました");
                setShoppingList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShoppingList();
    }, []);

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
        <MainLayout>
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

                {/* ローディング状態 */}
                {isLoading && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="space-y-4">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-muted-foreground">買い物リストを読み込み中...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* エラー状態 */}
                {error && !isLoading && (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-6">
                            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                                <ShoppingCart className="h-12 w-12 text-destructive"/>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-destructive">エラーが発生しました</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                            </div>
                            <Button onClick={() => window.location.reload()}>
                                再読み込み
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* 買い物リスト */}
                {!isLoading && !error && totalItems > 0 && (
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
                                                                {item.qty}{item.unit}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {item.recipeTitles.join("、")}
                                                        </p>
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
                )}

                {/* 空の状態 */}
                {!isLoading && !error && totalItems === 0 && (
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
                {!isLoading && !error && totalItems > 0 && (
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
                                    <Button 
                                        className="flex-1" 
                                        disabled={completedItems !== totalItems}
                                        onClick={handleComplete}
                                    >
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

                {/* 完了メッセージ */}
                {isCompleted && (
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-8 pb-8">
                            <div className="flex flex-col items-center justify-center text-center gap-3 w-full">
                                <Check className="h-8 w-8 text-green-600"/>
                                <div>
                                    <p className="text-lg font-semibold text-green-800">お買い物完了! お疲れ様でした!</p>
                                    <p className="text-sm text-green-600 mt-1">美味しい料理を楽しんでくださいね</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
} 