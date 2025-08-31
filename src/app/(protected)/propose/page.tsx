"use client"
import React, { useState } from 'react'

const TOOL_PRESET = ["電子レンジ","フライパン","鍋","トースター","まな板","包丁"] as const;

export default function ProposePage() {
    const [excludeText, setExcludeText] = useState("");
    const [tools, setTools] = useState<string[]>(["電子レンジ","フライパン","まな板","包丁"]);
    const [servings, setServings] = useState(1);
    const [goal, setGoal] = useState<"平日夕食"|"洗い物少なめ"|"高たんぱく">("平日夕食");
    const [budget, setBudget] = useState<"low"|"medium"|"high">("low");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const onToggleTool = (t: string) => 
        setTools(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev,t]);


    const parseExclude = (txt: string) => 
        // 改行、カンマ、全角カンマ、空白文字のいずれかで文字列を分割
        txt.split(/[\n,、\s]+/).map(s => s.trim()).filter(Boolean); 

    




  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">夕食レシピ提案</h1>

        <section className="space-y-2">
            <label className="font-medium">使いたくない食材（改行/読点区切り）</label>
            <textarea 
                className="w-full border rounded p-2"
                rows={3}
                value={excludeText}
                onChange={e => setExcludeText(e.target.value)}
                placeholder="例：酢、ピーマン、セロリ"
            />
        </section>

        <section className="space-y-2">
            <div className="font-medium">使える調理器具</div>
            <div className="flex flex-wrap gap-3">
                {TOOL_PRESET.map(t => (
                    <label key={t} className="flex items-center gap-2 border rounded px-3 py-2">
                        <input type="checkbox" checked={tools.includes(t)} onChange={() => onToggleTool(t)} />
                        {t}
                    </label>
                ))}
            </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
            <div>
                <label className="font-medium">人数</label>
                <input type="number" min={1} className="block border rounded p-2 mt-1 w-28" value={servings} onChange={e => setServings(parseInt(e.target.value || "1",10))}/>
            </div>
            <div>
                <label className="font-medium">予算</label>
                <select className="block border rounded p-2 mt-1" value={budget} onChange={e => setBudget(e.target.value as any)}>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                </select>
            </div>
        </section>

        <section>
            <label className="font-medium">目標</label> 
            <div className="flex gap-3 mt-2">
                {["平日夕食","洗い物少なめ","高たんぱく"].map(g => (
            <button key={g}
              onClick={() => setGoal(g as any)}
              className={`px-3 py-2 rounded border ${goal===g ? "bg-black text-white" : ""}`}>{g}</button>
          ))}
            </div>
        </section>

        <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{loading ? "提案中..." : "レシピを提案"}
        </button>

        {err && <p className="text-red-600">{err}</p>}

        {result && (
            <article className="border rounded p-4 space-y-3">
                <header className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{result.title}</h2>
                    <span className="text-sm opacity-70">{result.cook_time_min}分</span>
                </header>
                <div>
                    <h3 className="font-medium">材料</h3>
                    <ul className="list-disc pl-5">
                        {result.ingredients.map((it: any, i: number) => (
                            <li key={i}>{it.name} {it.qty}{it.optional ? "（任意）" : ""}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-medium">手順</h3>
                    <ol className="list-decimal pl-5">
                        {result.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ol>
                </div>
                <div>
                    <h3 className="font-medium">買い物リスト</h3>
                    <ul className="list-disc pl-5">
                        {result.shopping_list.map((it: any, i:number) => (
                            <li key={i}>{it.name} {it.qty}{it.unit}</li>
                        ))}
                    </ul>
                </div>
            </article>
        )}
    </main>
  )
}

