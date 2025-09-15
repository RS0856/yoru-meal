"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


type User = { id: string | null; email?: string | null };
type Props = { initialUser: User | null };

const LINKS = [
    { href: "/propose", label: "提案", protected: false },
    { href: "/recipes", label: "保存一覧", protected: true },
    { href: "/shopping", label: "買い物リスト", protected: true },
  ];

export default function Header({ initialUser }: Props) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser ?? null);
    const pathname = usePathname();

    useEffect(() => { setOpen(false);}, [pathname]);

    const NavLink = ({ href, label, isProtected }: { href: string; label: string; isProtected?: boolean }) => {
        const active = pathname === href;
        return (
            <Link href={href} className={`px-3 py-2 rounded hover:bg-white/10 ${active ? "bg-white/10" : ""}`}>
                {label}{isProtected ? "🔒": ""}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-40 bg-ym-surface/80 backdrop-blur border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-semibold">YoruMeal</span>
                    </Link>
                </div>

                {/* Center: Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {LINKS.map(l => (
                        <NavLink key={l.href} href={l.href} label={l.label} isProtected={l.protected} />
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <Link href={"/propose"} className="px-3 py-2 rounded bg-ym-accent text-black font-medium">
                    レシピを提案
                    </Link>
                    {user ? (
                        <a href="/auth/logout" className="px-3 py-2 rounded border">ログアウト</a>
                    ) : (
                        <a href="/auth/login" className="px-3 py-2 rounded border">GitHubでログイン</a>
                    )}
                </div>

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