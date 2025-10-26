"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCreateShoppingList } from "@/lib/useCreateShoppingList";

type Ingredient = { name: string; qty?: string | number; unit?: string; optional?: boolean };

interface ShoppingListButtonProps {
    recipeId: string;
    ingredients: Ingredient[];
}

export function ShoppingListButton({ recipeId, ingredients }: ShoppingListButtonProps) {
    const { createShoppingList } = useCreateShoppingList();

    const handleCreateShoppingList = () => {
        createShoppingList(recipeId, ingredients);
    };

    return (
        <Button size="sm" onClick={handleCreateShoppingList}>
            <ShoppingCart className="mr-2 h-4 w-4"/>
            買い物リスト
        </Button>
    );
}
