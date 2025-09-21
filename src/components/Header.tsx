"use client"

import { Plus, List, ShoppingCart, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


type User = { id: string | null; email?: string | null };
type Props = { initialUser: User | null };

const LINKS = [
    { href: "/", label: "ホーム", icon: Home, protected: false },
    { href: "/propose", label: "提案", icon: Plus, protected: false },
    { href: "/recipes", label: "保存一覧", icon: List,protected: true },
    { href: "/shopping", label: "買い物リスト", icon: ShoppingCart, protected: true },
  ];

export default function Header({ initialUser }: Props) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser ?? null);
    const pathname = usePathname();

    useEffect(() => { setOpen(false);}, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex lg:h-20 items-center justify-between max-w-7xl">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg lg:text-xl">夜</span>
                    </div>
                    <span className="font-bold text-xl lg:text-2xl">YoruMeal</span>
                </Link>


                {/* Center: Desktop Nav */}
                <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                    <nav className="flex items-center space-x-2 lg:space-x-4">
                        {LINKS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link 
                                    key={item.label} 
                                    href={item.href} 
                                    className={`flex items-center space-x-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:scale-105 ${
                                        pathname === item.href
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                    <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    {/* TODO: Githubログインボタンをコンポーネント化*/}
                    {/* <GitHubAuth /> */}
                </div>

                {/* Right: Actions */}
                {/* <div className="hidden md:flex items-center gap-2">
                    <Link href={"/propose"} className="px-3 py-2 rounded bg-ym-accent text-black font-medium">
                    レシピを提案
                    </Link>
                    {user ? (
                        <a href="/api/auth/logout" className="px-3 py-2 rounded border">ログアウト</a>
                    ) : (
                        <a href="/api/auth/login" className="px-3 py-2 rounded border">GitHubでログイン</a>
                    )}
                </div> */}

                {/* Mobile menu button */}
                <button className="md:hidden p-2 rounded border" aria-label="メニュー" aria-expanded={open} onClick={() => setOpen(!open)}>
                ☰
                </button>
            </div>

            {/* Mobile Drawer */}
            {open && (
                <div className="md:hidden border-t border-white/10 bg-ym-surface">
                    <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
                        {LINKS.map(l => (
                            <Link key={l.href} href={l.href} className="px-3 py-2 rounded hover:bg-white/10">
                            {l.label}{l.protected ? "🔒" : ""}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}