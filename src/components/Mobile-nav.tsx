"use client"

import { Plus, List, ShoppingCart, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/propose", label: "提案", icon: Plus },
    { href: "/recipes", label: "保存一覧", icon: List },
    { href: "/shopping", label: "買い物リスト", icon: ShoppingCart },
]

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
            <div className="grid grid-cols-4 h-16">
            {LINKS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link 
                        key={item.label} 
                        href={item.href} 
                        className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        <Icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                )
            })}
            </div>
        </nav>
    )
}