import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";

const InputSchema = z.object({
    exclude_ingredients: z.array(z.string()).default([]),
    available_tools: z.array(z.string()).default([]),
    servings: z.number().int().positive().default(1),
    constraints: z.object({ no_vinegar: z.boolean().default(true) }).default({ no_vinegar: true }),
    goals: z.array(z.string()).default(["平日夕食"]),
    budget_level: z.enum(["low", "medium", "high"]).default("low"),
    locale: z.string().default("JP")
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = InputSchema.parse(body);

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const system = [
            "あなたは一人暮らし社会人向けの夕食レシピ支援アシスタントです。",
            "厳密なJSONのみを出力してください。コードブロックは不要です。",
            "酢は使用禁止（no_vinegar=trueの場合）。",
            "除外食材は ingredients と shopping_list に含めないでください。",
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
                shopping_list: [{ name: "string", qty: "number", unit: "string" }],
                notes: ["string"]
            }
          });

          const resp = await client.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.2,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            response_format: { type: "json_object"}
          })

          const text = resp.choices[0]?.message?.content || "{}";
          const json = JSON.parse(text);
          const out = OutputSchema.safeParse(json);
          if (!out.success) {
            return NextResponse.json({ error: "LLM出力の検証に失敗", issues: out.error.flatten() }, { status: 400 });
          }
          return NextResponse.json(out.data);
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
    }
}