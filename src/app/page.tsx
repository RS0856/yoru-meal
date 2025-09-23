import { supabaseServer } from "./lib/supabaseServer";
import { MainLayout } from "@/components/Main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, List, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Plus,
    title: "レシピ提案",
    description: "AIがあなたに寄り添った夕食レシピを提案します",
    href: "/propose",
    color: "bg-primary text-primary-foreground",
  },
  {
    icon: List,
    title: "保存一覧",
    description: "お気に入りのレシピを保存して、いつでも確認できます",
    href: "/recipes",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: ShoppingCart,
    title: "買い物リスト",
    description: "レシピから自動で買い物リストを作成して、お買い物をスムーズに",
    href: "/shopping",
    color: "bg-accent text-accent-foreground",
  },
]

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <MainLayout initialUser={user}>
      <div className="space-y-16 lg:space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-balance leading-tight">今日の夕食、
              <br />
              <span className="text-primary">何にしよう？</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              除外食材や調理器具を指定するだけで、
              <br />
              AIがあなたに寄り添った夕食レシピを提案します
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Button asChild size="lg" className="h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg">
              <Link href={"/propose"}>
                <Plus />レシピを提案してもらう
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg bg-transparent">
              <Link href={"/recipes"}>
                <List className="mr-2 h-5 w-5 lg:h-6 lg:w-6"/>保存したレシピを見る
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">機能紹介</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              YoruMealで毎日の夕食作りをもっと楽しく、もっと簡単に
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center space-y-6 pb-4">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl ${feature.color} flex items-center justify-center mx-auto shadow-lg`}>
                      <Icon className="h-8 w-8 lg:h-10 lg:w-10" />
                    </div>
                    <CardTitle className="text-xl lg:text-2xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <CardDescription className="text-base lg:text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button asChild variant="outline" className="w-full bg-transparent h-11 lg:h-12">
                      <Link href={feature.href}>始める</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        </section>
      </div>
    </MainLayout>
  );
}
