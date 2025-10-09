import { MainLayout } from "@/components/Main-layout";
import { ShoppingCart, Plus } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ShoppingPage({ initialUser }: { initialUser: User | null }) {
    return (
        <MainLayout initialUser={initialUser}>
            <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
                {/* ヘッダー */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <ShoppingCart className="h-8 w-8"/>買い物リスト
                            </h1>
                            <p className="text-muted-foreground mt-2">レシピから作成された買い物リストです</p>
                        </div>
                        <Button asChild>
                            <Link href="/propose">
                                <Plus className="mr-2 h-4 w-4"/>新しいレシピを提案
                            </Link>
                        </Button>
                    </div>

                </div>
                
            </div>
        </MainLayout>
    );
} 