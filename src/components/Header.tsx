"use client"

import { Plus, List, ShoppingCart, Home, Menu, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/app/lib/supabaseBrowser";

type User = { id: string | null; email?: string | null };

const LINKS = [
    { href: "/", label: "ホーム", icon: Home, protected: false },
    { href: "/propose", label: "提案", icon: Plus, protected: false },
    { href: "/recipes", label: "保存一覧", icon: List,protected: true },
    { href: "/shopping", label: "買い物リスト", icon: ShoppingCart, protected: true },
  ];

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const supabase = supabaseBrowser();
        
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

        // 認証状態の変更を監視
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkAuth();
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex lg:h-20 items-center justify-between max-w-7xl">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                        <Image src="/icon.svg" alt="YoruMeal" width={40} height={40} className="h-full w-full object-contain" />
                    </div>
                    <span className="font-bold text-xl lg:text-2xl">YoruMeal</span>
                </Link>


                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                    <nav className="flex items-center space-x-2 lg:space-x-4">
                        {LINKS.map((item) => {
                            const Icon = item.icon;
                            const handleClick = async (e: React.MouseEvent) => {
                                if (item.protected && !user) {
                                    e.preventDefault();
                                    window.location.href = "/login";
                                }
                            };
                            return (
                                <Link 
                                    key={item.label} 
                                    href={item.href} 
                                    onClick={handleClick}
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

                    <Button>
                        
                        {user ? (
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
                    <Button>
                        
                        {user ? (
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
                            <nav className="flex flex-col space-y-4 mt-8">
                                {LINKS.map((item) => {
                                    const Icon = item.icon;
                                    const handleClick = async (e: React.MouseEvent) => {
                                        if (item.protected && !user) {
                                            e.preventDefault();
                                            window.location.href = "/login";
                                        }
                                    };
                                    return (
                                        <Link 
                                            key={item.label} 
                                            href={item.href} 
                                            onClick={handleClick}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                                pathname === item.href
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