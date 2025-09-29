"use client"
import { useToast } from "@/components/Toast";
import React, { useState } from 'react'
import { MainLayout }from "@/components/Main-layout";
import { User } from "@supabase/supabase-js";
import { Card, CardHeader, CardTitle, CardContent,CardDescription } from "@/components/ui/card";
import { ChefHat, Loader2, Heart, ShoppingCart, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
const TOOL_PRESET = ["電子レンジ","フライパン","鍋","トースター"] as const;

// 型定義
type BudgetLevel = "low" | "medium" | "high";
type GoalType = "時短" | "ボリューム重視" | "バランス重視" | "ヘルシー";
type Ingredient = { name: string; qty: number; unit: string; optional?: boolean };
type ShoppingItem = { name: string; qty: number; unit: string };
export type RecipeProposal = {
    title: string;
    cook_time_min: number;
    ingredients: Ingredient[];
    steps: string[];
    tools: string[];
    shopping_lists: ShoppingItem[];
    notes: string[];
};

// APIエラーメッセージ抽出ヘルパー
function extractApiErrorMessage(data: unknown): string | null {
    if (data && typeof data === "object" && "error" in data) {
        const v = (data as { error?: unknown }).error;
        if (typeof v === "string") return v;
        try { return JSON.stringify(v); } catch { return ""; }
    }
    return null;
}

export default function ProposePage({ initialUser }: { initialUser: User | null }) {
    const [excludeText, setExcludeText] = useState("");
    const [tools, setTools] = useState<string[]>(["電子レンジ"]);
    const [servings, setServings] = useState(1);
    const [goal, setGoal] = useState<GoalType>("時短");
    const [budget, setBudget] = useState<BudgetLevel>("low");
    const [result, setResult] = useState<RecipeProposal | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const onToggleTool = (t: string) => 
        setTools(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev,t]);

    const parseExclude = (txt: string): string[] => 
        // 改行、カンマ、全角カンマ、空白文字のいずれかで文字列を分割
        txt.split(/[\n,、\s]+/).map(s => s.trim()).filter(Boolean); 

    const onPropose = async () => {
        setLoading(true);
        setErr(null);
        setResult(null);
        try {
            const res = await fetch("/api/propose",{
                method:"POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                    exclude_ingredients: parseExclude(excludeText),
                    available_tools:tools,
                    servings,
                    constraints: { no_vinegar: true },
                    goals: [goal],
                    budget_level: budget,
                    locale: "JP"
                })
            });

            // Content-Type を見て JSON/HTML を判定し、HTML の場合はテキストとして扱う
            const contentType = res.headers.get("content-type") || "";
            let data: unknown;
            if (contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    // HTML 等が返ってきた場合はそのままメッセージ化
                    throw new Error(text.slice(0, 200) || "サーバーエラー");
                }
            }

            if (!res.ok) {
                const msg = extractApiErrorMessage(data) ?? "提案に失敗しました";
                throw new Error(msg);
            }
            setResult(data as RecipeProposal);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "不明なエラーが発生しました";
            setErr(message);
        } finally {
            setLoading(false);
        }
    };

  return (
    <MainLayout initialUser={initialUser}>
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
                                <ChefHat className="h-5 w-5 lg:h-6 lg:w-6"/>
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
                                    <Label htmlFor="excludeText" className="text-base font-medium">除外食材</Label>
                                    <Textarea
                                        id="excludeText"
                                        placeholder="例：酢、ナッツ、乳製品"
                                        value={excludeText}
                                        onChange={e => setExcludeText(e.target.value)}
                                        className="min-h-[120px] text-base"
                                    />
                                </div>

                                {/* 調理器具 */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">使用可能な調理器具</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {TOOL_PRESET.map(tool => (
                                            <div key={tool} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                <Checkbox id={tool} checked={tools.includes(tool)} onCheckedChange={() => onToggleTool(tool)} className="h-5 w-5"/>
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
                                        <Label htmlFor="servings" className="text-base font-medium">人数</Label>
                                        <Select value={servings.toString()} onValueChange={e => setServings(parseInt(e,10))}>
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
                                        <Label htmlFor="budget" className="text-base font-medium">予算</Label>
                                        <Select value={budget} onValueChange={e => setBudget(e as BudgetLevel)}>
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
                                        <Label htmlFor="goal" className="text-base font-medium">目標</Label>
                                        <Select value={goal} onValueChange={e => setGoal(e as GoalType)}>
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

                                <Button disabled={loading} onClick={onPropose} className="w-full h-14 text-base lg:text-lg">
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                提案中...
                                            </>
                                        ) : (
                                            <>
                                                <ChefHat className="h-5 w-5" />
                                                レシピを提案してもらう
                                            </>
                                        )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-lg">💡提案のコツ</CardTitle>
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
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row  sm:items-center justify-between gap-4 text-xl lg:text-2xl">
                            <span>{result.title}</span>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm"  className="h-10 bg-transparent">
                                    {/* TODO: 保存機能を実装する */}
                                    <Heart className="mr-2 h-4 w-4"/>保存
                                </Button>
                                <Button size="sm"  className="h-10">
                                    {/* TODO: 買い物リスト機能を実装する */}
                                    <ShoppingCart className="mr-2 h-4 w-4"/>買い物リスト
                                </Button>
                            </div>
                        </CardTitle>
                        <div className="flex gap-6 text-base text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5"/>{result.cook_time_min}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* 材料 */}
                        <div>
                            <h3 className="font-semibold mb-4">材料</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.ingredients.map((item: Ingredient, index: number) => (
                                    <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-muted-foreground">{item.qty}{item.unit}</span>
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
                        {result.tools.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-4 text-lg">使用する調理器具</h3>
                                <div className="flex flex-wrap gap-3">
                                    {result.tools.map((tool: string, index: number) => {
                                        const toolLabel = TOOL_PRESET.find(t => t === tool);
                                        return (
                                            <span key={index} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                                {toolLabel}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    </MainLayout>
    // <main className="max-w-3xl mx-auto p-6 space-y-6">
    //     <h1 className="text-2xl font-bold">夕食レシピ提案</h1>

    //     <section className="space-y-2">
    //         <label className="font-medium">使いたくない食材（改行/読点区切り）</label>
    //         <textarea 
    //             className="w-full border rounded p-2"
    //             rows={3}
    //             value={excludeText}
    //             onChange={e => setExcludeText(e.target.value)}
    //             placeholder="例：酢、ピーマン、セロリ"
    //         />
    //     </section>

    //     <section className="space-y-2">
    //         <div className="font-medium">使える調理器具</div>
    //         <div className="flex flex-wrap gap-3">
    //             {TOOL_PRESET.map(t => (
    //                 <label key={t} className="flex items-center gap-2 border rounded px-3 py-2">
    //                     <input type="checkbox" checked={tools.includes(t)} onChange={() => onToggleTool(t)} />
    //                     {t}
    //                 </label>
    //             ))}
    //         </div>
    //     </section>

    //     <section className="grid grid-cols-2 gap-4">
    //         <div>
    //             <label className="font-medium">人数</label>
    //             <input type="number" min={1} className="block border rounded p-2 mt-1 w-28" value={servings} onChange={e => setServings(parseInt(e.target.value || "1",10))}/>
    //         </div>
    //         <div>
    //             <label className="font-medium">予算</label>
    //             <select className="block border rounded p-2 mt-1" value={budget} onChange={e => setBudget(e.target.value as BudgetLevel)}>
    //                 <option value="low">low</option>
    //                 <option value="medium">medium</option>
    //                 <option value="high">high</option>
    //             </select>
    //         </div>
    //     </section>

    //     <section>
    //         <label className="font-medium">目標</label> 
    //         <div className="flex gap-3 mt-2">
    //             {["平日夕食","洗い物少なめ","高たんぱく"].map(g => (
    //         <button key={g}
    //           onClick={() => setGoal(g as GoalType)}
    //           className={`px-3 py-2 rounded border ${goal===g ? "bg-black text-white" : ""}`}>{g}</button>
    //       ))}
    //         </div>
    //     </section>

    //     <button disabled={loading} onClick={onPropose} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
    //         {loading ? "提案中..." : "レシピを提案"}
    //     </button>

    //     {err && <p className="text-red-600">{err}</p>}

    //     {result && (
    //         <article className="border rounded p-4 space-y-3">
    //             <header className="flex items-center justify-between">
    //                 <h2 className="text-xl font-semibold">{result.title}</h2>
    //                 <span className="text-sm opacity-70">{result.cook_time_min}分</span>
    //             </header>
    //             <div>
    //                 <h3 className="font-medium">材料</h3>
    //                 <ul className="list-disc pl-5">
    //                     {result.ingredients.map((it: Ingredient, i: number) => (
    //                         <li key={i}>{it.name} {it.qty}{it.optional ? "（任意）" : ""}</li>
    //                     ))}
    //                 </ul>
    //             </div>
    //             <div>
    //                 <h3 className="font-medium">手順</h3>
    //                 <ol className="list-decimal pl-5">
    //                     {result.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
    //                 </ol>
    //             </div>
    //             <div>
    //                 <h3 className="font-medium">買い物リスト</h3>
    //                 <ul className="list-disc pl-5">
    //                     {result.shopping_lists.map((it: ShoppingItem, i:number) => (
    //                         <li key={i}>{it.name} {it.qty}{it.unit}</li>
    //                     ))}
    //                 </ul>
    //             </div>
    //             <SaveButtons result={result}/>
    //         </article>
    //     )}
    // </main>
  )
}

function SaveButtons({ result }: { result: RecipeProposal }) {
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const { push } = useToast();

    const onSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result)
            });
            const contentType = res.headers.get("content-type") || "";
            let data: unknown;
            if (contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                try { data = JSON.parse(text); } catch { throw new Error(text.slice(0,200) || "サーバーエラー"); }
            }
            if (!res.ok) {
                const msg = extractApiErrorMessage(data) ?? "保存に失敗しました";
                throw new Error(msg);
            }
            push({ text: "保存しました", type: "success"});
            setMsg("レシピを保存しました！");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "不明なエラーが発生しました";
            push({ text: message, type: "error" });
            setMsg(`エラー: ${message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button disabled={saving} onClick={onSave} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50">
                {saving ? "保存中..." : "このレシピを保存"}
            </button>
            {msg && <span className="text-sm">{msg}</span>}
        </div>
    );
}
