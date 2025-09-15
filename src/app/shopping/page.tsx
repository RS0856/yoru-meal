"use client"

import { useEffect, useState } from "react"

type Item = { name: string, qty: number, unit: string };
type ShoppingData = { recipe_id: string, items: Item[], recipe_title?: string };

export default function ShoppingPage() {
    const [data, setData] = useState<ShoppingData | null>(null);
    const [checked, setChecked] = useState<Record<number,boolean>>({});
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const KEY = (id:string) => `ym-shopping-${id}`;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("api/shopping/latest");
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error ?? "読み込みに失敗しました");
                setData(json);
            } catch (e: any) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    },[]);

    useEffect(() => {
        if(data?.recipe_id) {
            const raw = localStorage.getItem(KEY(data.recipe_id));
            if(raw) setChecked(JSON.parse(raw));
        }
    },[data?.recipe_id]);

    useEffect(() => {
        if(data?.recipe_id) localStorage.setItem(KEY(data.recipe_id),JSON.stringify(checked));
    },[checked, data?.recipe_id]);

    const toggle = (i: number) => setChecked(prev => ({...prev, [i]: !prev[i]}));

    if (loading) return <main className="max-w-3xl mx-auto p-6">読み込み中...</main>
    if (err) return <main className="max-w-3xl mx-auto p-6 text-red-600">{err}</main>;
    if (!data) return <main className="max-w-3xl mx-auto p-6">データがありません。</main>

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">買い物リスト</h1>
            {data.recipe_title && (
                <p className="opacity-80">対象レシピ：{data.recipe_title}</p>
            )}
            <ul className="space-y-2">
                {data.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 border rounded p-3">
                        <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)}/>
                        <div className={`${checked[i] ? "line-through opacity-60": ""}`}>{it.name} {it.qty}{it.unit}</div>
                    </li>
                ))}
            </ul>
        </main>
    );
}