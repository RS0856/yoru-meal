"use client"

import { Plus, List, ShoppingCart, Home, Menu, Mail, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";

type User = { id: string | null; email?: string | null };

const LINKS = [
    { href: "/", label: "ホーム", icon: Home, protected: false },
    { href: "/propose", label: "提案", icon: Plus, protected: true },
    { href: "/recipes", label: "保存一覧", icon: List, protected: true },
    { href: "/shopping", label: "買い物リスト", icon: ShoppingCart, protected: true },
];

// デモモード用のリンク
const DEMO_LINKS = [
    { href: "/", label: "ホーム", icon: Home, protected: false },
    { href: "/demo-propose", label: "提案", icon: Plus, protected: false },
    { href: "/demo-recipes", label: "保存一覧", icon: List, protected: false },
    { href: "/demo-shopping", label: "買い物リスト", icon: ShoppingCart, protected: false },
];

export default function Header() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const pathname = usePathname();

    useEffect(() => {
        const supabase = supabaseBrowser();
        
        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        // 現在のユーザーを取得（セッションからも確認）
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    setUser(session.user);
                    return;
                }
                
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch {
                setUser(null);
            }
        };
        
        checkAuth();

        return () => subscription.unsubscribe();
    }, []);

    // デモモード判定
    const isDemoMode = pathname.startsWith("/demo-");
    const currentLinks = isDemoMode ? DEMO_LINKS : LINKS;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex lg:h-20 items-center justify-between max-w-7xl">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                        <Image src="/icon.svg" alt="YoruMeal" width={40} height={40} className="h-full w-full object-contain" priority />
                    </div>
                    <span className="font-bold text-xl lg:text-2xl">YoruMeal</span>
                </Link>


                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                    {/* デモモードバッジ */}
                    {isDemoMode && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                            <Eye className="h-3 w-3 mr-1" />
                            デモモード
                        </Badge>
                    )}
                    <nav className="flex items-center space-x-2 lg:space-x-4">
                        {currentLinks.map((item) => {
                            const Icon = item.icon;
                            const handleClick = async (e: React.MouseEvent) => {
                                // デモモードでは認証チェックをスキップ
                                if (!isDemoMode && item.protected && !user) {
                                    e.preventDefault();
                                    window.location.href = "/login";
                                }
                            };
                            // アクティブ状態の判定（ホーム以外）
                            const isActive = item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={handleClick}
                                    className={`flex items-center space-x-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 hover:scale-105 ${
                                        isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}>
                                    <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <Button className="min-w-[100px]">
                        
                        {user === undefined ? (
                        <>
                            <Mail className="h-4 w-4 invisible" />
                            <span className="invisible whitespace-nowrap">ログイン</span>
                        </>
                        ) : user ? (
                        <a href="/api/auth/logout" className="">ログアウト</a>
                        ) : (
                        <>
                            <Mail className="h-4 w-4" />
                            <a href="/login" className="">ログイン</a>
                        </>
                        )}
                    </Button>
                </div>

                {/* Mobile Nav */}
                <div className="flex items-center space-x-2 md:hidden">
                    <Button className="min-w-[100px]">
                        
                        {user === undefined ? (
                        <>
                            <Mail className="h-4 w-4 invisible" />
                            <span className="invisible whitespace-nowrap">ログイン</span>
                        </>
                        ) : user ? (
                        <a href="/api/auth/logout" className="">ログアウト</a>
                        ) : (
                        <>
                            <Mail className="h-4 w-4" />
                            <a href="/login" className="">ログイン</a>
                        </>
                        )}
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">メニューを開く</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetTitle className="sr-only">メニュー</SheetTitle>
                            {/* デモモードバッジ（モバイル） */}
                            {isDemoMode && (
                                <div className="mt-4">
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                        <Eye className="h-3 w-3 mr-1" />
                                        デモモード
                                    </Badge>
                                </div>
                            )}
                            <nav className="flex flex-col space-y-4 mt-8">
                                {currentLinks.map((item) => {
                                    const Icon = item.icon;
                                    const handleClick = async (e: React.MouseEvent) => {
                                        // デモモードでは認証チェックをスキップ
                                        if (!isDemoMode && item.protected && !user) {
                                            e.preventDefault();
                                            window.location.href = "/login";
                                        }
                                    };
                                    // アクティブ状態の判定（ホーム以外）
                                    const isActive = item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={handleClick}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                                isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}