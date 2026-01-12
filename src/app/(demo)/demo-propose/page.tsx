"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/Main-layout";
import { ChefHat, Clock, Heart, LogIn, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { BudgetLevel, GoalType, Ingredient } from "@/app/lib/types";
import { DEMO_PROPOSED_RECIPE } from "@/app/lib/demo-data";

const TOOL_PRESET = ["電子レンジ", "フライパン", "鍋", "トースター"] as const;

export default function DemoProposePage() {
    const [excludeText, setExcludeText] = useState("");
    const [tools, setTools] = useState<string[]>(["電子レンジ"]);
    const [servings, setServings] = useState(1);
    const [goal, setGoal] = useState<GoalType>("時短");
    const [budget, setBudget] = useState<BudgetLevel>("low");
    const [showResult, setShowResult] = useState(false);

    const onToggleTool = (t: string) =>
        setTools((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

    const onDemoPropose = () => {
        // デモモードでは固定レシピを表示
        setShowResult(true);
    };

    const result = DEMO_PROPOSED_RECIPE;

    return (
        <MainLayout>
            <div className="space-y-8 lg:space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl lg:text-4xl font-bold">レシピ提案</h1>
                    <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                        条件を入力して、あなたにぴったりのレシピを提案してもらいましょう
                    </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl lg:text-2xl">
                                    <ChefHat className="h-5 w-5 lg:h-6 lg:w-6" />
                                    条件を入力してください
                                </CardTitle>
                                <CardDescription className="text-base">
                                    除外したい食材や使用可能な調理器具を選択してください
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {/* 除外食材 */}
                                    <div className="space-y-3">
                                        <Label htmlFor="excludeText" className="text-base font-medium">
                                            除外食材
                                        </Label>
                                        <Textarea
                                            id="excludeText"
                                            placeholder="例：酢、ナッツ、乳製品"
                                            value={excludeText}
                                            onChange={(e) => setExcludeText(e.target.value)}
                                            className="min-h-[120px] text-base"
                                        />
                                    </div>

                                    {/* 調理器具 */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-medium">使用可能な調理器具</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {TOOL_PRESET.map((tool) => (
                                                <div
                                                    key={tool}
                                                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={tool}
                                                        checked={tools.includes(tool)}
                                                        onCheckedChange={() => onToggleTool(tool)}
                                                        className="h-5 w-5"
                                                    />
                                                    <Label htmlFor={tool} className="text-sm font-normal cursor-pointer flex-1">
                                                        {tool}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* その他の条件 */}
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="servings" className="text-base font-medium">
                                                人数
                                            </Label>
                                            <Select value={servings.toString()} onValueChange={(e) => setServings(parseInt(e, 10))}>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1人分</SelectItem>
                                                    <SelectItem value="2">2人分</SelectItem>
                                                    <SelectItem value="3">3人分</SelectItem>
                                                    <SelectItem value="4">4人分</SelectItem>
                                                    <SelectItem value="5">5人分以上</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="budget" className="text-base font-medium">
                                                予算
                                            </Label>
                                            <Select value={budget} onValueChange={(e) => setBudget(e as BudgetLevel)}>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">低め</SelectItem>
                                                    <SelectItem value="medium">普通</SelectItem>
                                                    <SelectItem value="high">高め</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="goal" className="text-base font-medium">
                                                目標
                                            </Label>
                                            <Select value={goal} onValueChange={(e) => setGoal(e as GoalType)}>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="時短">時短</SelectItem>
                                                    <SelectItem value="ボリューム重視">ボリューム重視</SelectItem>
                                                    <SelectItem value="バランス重視">バランス重視</SelectItem>
                                                    <SelectItem value="ヘルシー">ヘルシー</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button onClick={onDemoPropose} className="w-full h-14 text-base lg:text-lg">
                                        <ChefHat className="h-5 w-5" />
                                        レシピを提案してもらう（デモ）
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">提案のコツ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-medium mb-2">除外食材について</h4>
                                    <p className="text-muted-foreground">
                                        アレルギーや苦手な食材を具体的に入力すると、より適切なレシピを提案できます。
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">調理器具の選択</h4>
                                    <p className="text-muted-foreground">
                                        お持ちの調理器具を選択することで、実際に作れるレシピのみを提案します。
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">条件の設定</h4>
                                    <p className="text-muted-foreground">
                                        人数・予算・目標を設定すると、より具体的で実用的なレシピを提案できます。
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 提案結果 */}
                {showResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xl lg:text-2xl">
                                <span>{result.title}</span>
                                <div className="flex gap-3">
                                    {/* デモモードでは保存ボタンを無効化 */}
                                    <Button variant="outline" size="sm" className="h-10 bg-transparent" disabled title="ログインすると保存できます">
                                        <Heart className="mr-2 h-4 w-4" />
                                        保存
                                    </Button>
                                </div>
                            </CardTitle>
                            {result.description && (
                                <CardDescription className="text-base mt-2">{result.description}</CardDescription>
                            )}
                            <div className="flex gap-6 text-base text-muted-foreground mt-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {result.cook_time_min}分
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* デモモード説明 */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium mb-1">デモモードでの表示です</p>
                                    <p>
                                        実際のアプリでは、AIがあなたの条件に合わせたレシピを提案します。
                                        <Link href="/login" className="underline ml-1">
                                            ログインして試す
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            {/* 材料 */}
                            <div>
                                <h3 className="font-semibold mb-4">材料</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {result.ingredients.map((item: Ingredient, index: number) => (
                                        <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-muted-foreground">
                                                {item.qty}
                                                {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 作り方 */}
                            <div>
                                <h3 className="font-semibold mb-4 text-lg">作り方</h3>
                                <ol className="space-y-4">
                                    {result.steps.map((step: string, index: number) => (
                                        <li key={index} className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-base leading-relaxed pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* 使用する調理器具 */}
                            {result.tools && result.tools.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-4 text-lg">使用する調理器具</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {result.tools
                                            .filter((tool) => TOOL_PRESET.includes(tool as (typeof TOOL_PRESET)[number]))
                                            .map((tool: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                                                >
                                                    {tool}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* ログインCTA */}
                            <div className="pt-4 border-t">
                                <Button asChild className="w-full h-12">
                                    <Link href="/login">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        ログインしてレシピを保存する
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
