import { useRouter } from "next/navigation";
import { Ingredient } from "@/app/lib/types";

export function useCreateShoppingList() {
    const router = useRouter();

    const createShoppingList = async (recipeId: string, ingredients: Ingredient[]) => {
        try {
            const response = await fetch("/api/shopping/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipe_id: recipeId,
                    ingredients: ingredients,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "買い物リストの作成に失敗しました");
            }

            // 成功時は買い物リストページに遷移
            router.push("/shopping");
        } catch (error) {
            console.error("買い物リスト作成エラー:", error);
            alert(error instanceof Error ? error.message : "買い物リストの作成に失敗しました");
        }
    };

    return { createShoppingList };
}
