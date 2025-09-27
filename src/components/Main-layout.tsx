import Header from "./Header";
import MobileNav from "./Mobile-nav";
import Footer from "./Footer";
import { User } from "@supabase/supabase-js";

interface MainLayoutProps {
    children: React.ReactNode;
    initialUser: User | null;
}

export function MainLayout({ children, initialUser }: MainLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header initialUser={initialUser} />
            <main className="flex-1 pb-16 md:pb-0">
                <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
                    {children}
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
}