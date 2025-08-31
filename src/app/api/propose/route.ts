import { z } from "zod";

const InputSchema = z.object({
    exclude_ingredients: z.array(z.string()).default([]),
    available_tools: z.array(z.string()).default([]),
    servings: z.number().int().positive().default(1),
    constraints: z.object({ no_vinegar: z.boolean().default(true) }).default({ no_vinegar: true }),
    goals: z.array(z.string()).default(["平日夕食"]),
    budget_level: z.enum(["low", "medium", "high"]).default("low"),
    locale: z.string().default("JP")
});