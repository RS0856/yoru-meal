import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";
import { OutputSchema } from "@/app/lib/validators";
import { supabaseServer } from "@/app/lib/supabaseServer";


const InputSchema = z.object({
    exclude_ingredients: z.array(z.string()).default([]),
    available_tools: z.array(z.string()).default([]),
    servings: z.number().int().positive().default(1),
    goals: z.array(z.string()).default(["時短"]),
    budget_level: z.enum(["low", "medium", "high"]).default("low"),
    locale: z.string().default("JP")
});

async function rateLimit(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  user: { id: string } | null,
  req: NextRequest,
  route="/api/propose",
  limit = 5,
  windowSec = 60
) {
  const xfwd = req.headers.get("x-forwarded-for") || "";
  const ip = xfwd.split(",")[0]?.trim() || "unknown";
  const key = user?.id ?? `ip:${ip}`;

  const { data: rows, error } = await supabase
    .from("api_rate_limit")
    .select("id, at")
    .eq("key", key)
    .eq("route", route)
    .gte("at", new Date(Date.now() - windowSec*1000).toISOString());

  if (error) throw error;
  if ((rows?.length ?? 0) >= limit) {
    return { ok: false, key };
  }
  await supabase.from("api_rate_limit").insert({ key, route });
  return { ok: true, key };
}

async function callLLM(client: OpenAI, system: string, user: string) {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
          { role: "system", content: system },
          { role: "user", content: user }
      ],
      response_format: { type: "json_object"}
    });
    return resp.choices[0]?.message?.content || "{}";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parseResult = InputSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "入力バリデーションエラー", issues: parseResult.error.flatten() },
                { status: 422 }
            );
        }
        const parsed = parseResult.data;
        
        // Supabase接続と認証を一度だけ実行
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        
        // レート制限チェックと過去の提案履歴取得を並列実行
        const fetchHistory = async () => {
            if (!user) return { data: null, error: null };
            try {
                const result = await supabase
                    .from("recipes")
                    .select("title")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(10);
                return { data: result.data, error: result.error };
            } catch (e: unknown) {
                return { data: null, error: e };
            }
        };

        const [rateLimitResult, historyResult] = await Promise.all([
            rateLimit(supabase, user, req, "/api/propose", 10, 86400),
            fetchHistory()
        ]);
        
        // レート制限チェック
        if (!rateLimitResult.ok) {
            return NextResponse.json({ error: "1日の提案回数上限（10回）に達しました。明日またお試しください。"}, { status: 429 });
        }
        
        // 過去の提案履歴を処理（ログインユーザーのみ、上記で並列取得済み）
        let recentTitles: string[] = [];
        if (user && historyResult.data && !historyResult.error) {
            recentTitles = historyResult.data.map((r: { title: string }) => r.title);
        } else if (historyResult.error) {
            // 履歴取得失敗時は通常通り提案を継続
            console.error("Failed to fetch recipe history:", historyResult.error);
        }
        
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // システムプロンプトの基本部分
        const baseSystemPrompt = [
            "あなたは一人暮らし社会人向けの夕食レシピ支援アシスタントです。",
            "厳密なJSONのみを出力してください。コードブロックは不要です。",
            "日本語で出力してください。",
            "descriptionは200文字以内で、レシピの概要を説明してください。",
            "除外食材は ingredients と shopping_lists に含めないでください。",
            "調理時間は原則30分以内（最大45分）。日本で入手しやすい食材を優先。",
            "分量は servings（人数）に合わせてください。",
            "shopping_listsの各Itemにはcategory（肉、魚、野菜、調味料、その他）を付与してください。",
            "多様性を重視してください。和食、洋食、中華、エスニックなど様々なカテゴリから選択してください。"
          ].join("\n");
        
        // 履歴がある場合は重複回避の指示を追加
        const system = recentTitles.length > 0
            ? `${baseSystemPrompt}\n\n重要: 以下のレシピタイトルと似た提案や、同じような料理は避けてください。多様性を重視してください:\n${recentTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
            : baseSystemPrompt;

          const userMessage = JSON.stringify({
            ...parsed,
            output_schema: {
                title: "string",
                description: "string?",
                cook_time_min: "number",
                ingredients: [{ name: "string", qty: "number", unit: "string", optional: "boolean?" }],
                steps: ["string"],
                tools: ["string"],
                shopping_lists: [{ name: "string", qty: "number", unit: "string", category: "肉|魚|野菜|調味料|その他" }],
                notes: ["string"]
            }
          });
          //1回目のLLMコール
          let text = await callLLM(client, system, userMessage);
          let parseOut = OutputSchema.safeParse(JSON.parse(text));

          //失敗したら1回だけリトライ
          if (!parseOut.success) {
            const reinforceSystem = system + "\n必ず有効なJSONのみで返答し、未定義・NaN・コメントは使用しないこと。";
            text = await callLLM(client, reinforceSystem, userMessage);
            parseOut = OutputSchema.safeParse(JSON.parse(text));
          }
          if (!parseOut.success) {
            return NextResponse.json({ error: "LLM出力の検証に失敗", issues: parseOut.error.flatten() }, { status: 422 });
          }
          return NextResponse.json(parseOut.data);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}