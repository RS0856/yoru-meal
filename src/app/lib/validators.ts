import { z } from "zod";

export const ItemTag = z.enum(["肉", "魚", "野菜", "調味料", "その他"]);

export const Ingredient = z.object({
    name: z.string(),
    qty: z.number().nonnegative(),
    unit: z.string(),
    optional: z.boolean().optional().default(false)
});

export const ShoppingItem = z.object({
    name: z.string(),
    qty: z.number(),
    unit: z.string(),
    tag: ItemTag.optional()
});

export const OutputSchema = z.object({
    title: z.string().min(1),
    description: z.string().max(200).optional(),
    cook_time_min: z.number().int().positive().max(45),
    ingredients: z.array(Ingredient).min(1),
    steps: z.array(z.string().min(1)).min(1),
    tools: z.array(z.string()).default([]),
    shopping_lists: z.array(z.object({ name: z.string(), qty: z.number(), unit: z.string() })).default([]),
    notes: z.array(z.string()).default([])
});