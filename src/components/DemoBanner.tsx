"use client";

import { Info, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function DemoBanner() {
    return (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-800">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">
                        デモモード: 閲覧のみ可能です。保存・AI提案機能はログイン後に利用できます。
                    </span>
                </div>
                <Button asChild size="sm" variant="outline" className="bg-white whitespace-nowrap">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        ログインして全機能を使う
                    </Link>
                </Button>
            </div>
        </div>
    );
}
