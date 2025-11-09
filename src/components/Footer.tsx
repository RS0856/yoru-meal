import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-muted/50 mt-auto">
            <div className="container px-4 py-3">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">夜</span>
                        </div>
                        <span className="font-semibold">YoruMeal</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-foreground">
                        ホーム
                        </Link>
                        <Link href="/propose" className="text-muted-foreground hover:text-foreground">
                        レシピ提案
                        </Link>
                        <Link href="/recipes" className="text-muted-foreground hover:text-foreground">
                        保存一覧
                        </Link>
                        <Link href="/shopping" className="text-muted-foreground hover:text-foreground">
                        買い物リスト
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm pt-4 border-t border-border">
                        <a 
                            href="mailto:yorumeal.contact@gmail.com" 
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-4 w-4" />
                            お問い合わせ
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} yoru-meal. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}