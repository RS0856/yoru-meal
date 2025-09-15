import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";
import { OutputSchema } from "@/app/lib/validators";
import { supabaseServer } from "@/app/lib/supabaseServer";


const InputSchema = z.object({
    exclude_ingredients: z.array(z.string()).default([]),
    available_tools: z.array(z.string()).default([]),
    servings: z.number().int().positive().default(1),
    constraints: z.object({ no_vinegar: z.boolean().default(true) }).default({ no_vinegar: true }),
    goals: z.array(z.string()).default(["平日夕食"]),
    budget_level: z.enum(["low", "medium", "high"]).default("low"),
    locale: z.string().default("JP")
});

async function rateLimit(req: NextRequest, route="/api/propose", limit = 5, windowSec = 60) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

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
      temperature: 0.2,
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
        const gate = await rateLimit(req, "/api/propose", 5, 60);
        if (!gate.ok) return NextResponse.json({ error: "しばらくしてから再試行してください"}, { status: 429 });
        
        const body = await req.json();
        const parsed = InputSchema.parse(body);
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const system = [
            "あなたは一人暮らし社会人向けの夕食レシピ支援アシスタントです。",
            "厳密なJSONのみを出力してください。コードブロックは不要です。",
            "酢は使用禁止（no_vinegar=trueの場合）。",
            "除外食材は ingredients と shopping_lists に含めないでください。",
            "調理時間は原則30分以内（最大45分）。日本で入手しやすい食材を優先。",
            "分量は servings（人数）に合わせてください。"
          ].join("\n");

          const user = JSON.stringify({
            ...parsed,
            output_schema: {
                title: "string",
                cook_time_min: "number",
                ingredients: [{ name: "string", qty: "number", unit: "string", optional: "boolean?" }],
                steps: ["string"],
                tools: ["string"],
                shopping_lists: [{ name: "string", qty: "number", unit: "string" }],
                notes: ["string"]
            }
          });
          //1回目のLLMコール
          let text = await callLLM(client, system, user);
          let parseOut = OutputSchema.safeParse(JSON.parse(text));

          //失敗したら1回だけリトライ
          if (!parseOut.success) {
            const reinforce = system + "\n必ず有効なJSONのみで返答し、未定義・NaN・コメントは使用しないこと。";
            text = await callLLM(client, system, user);
            parseOut = OutputSchema.safeParse(JSON.parse(text));
          }
          if (!parseOut.success) {
            return NextResponse.json({ error: "LLM出力の検証に失敗", issues: parseOut.error.flatten() }, { status: 422 });
          }
          return NextResponse.json(parseOut.data);
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
    }
}