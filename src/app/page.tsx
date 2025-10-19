import { MainLayout } from "@/components/Main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, List, ShoppingCart, ChefHat, Clock, Heart } from "lucide-react";
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

const steps = [
  {
    step: "1",
    title: "除外食材を入力",
    description: "使いたくない食材を入力してください",
    icon: ChefHat,
  },
  {
    step: "2",
    title: "レシピ提案を受ける",
    description: "AIがあなたの条件に合った夕食レシピを提案します",
    icon: Clock,
  },
  {
    step: "3",
    title: "保存・買い物リスト作成",
    description: "気に入ったレシピを保存し、買い物リストを作成できます",
    icon: Heart,
  },
]

export default async function Home() {
  return (
    <MainLayout>
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

        {/* How It Works Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">使い方</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">3つのステップで今夜の夕食が決まります</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center space-y-6 relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-12 h-0.5 bg-primary/20 transform -translate-x-6"/>
                  )}
                  <div className="relative">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-lg">
                      <Icon className="h-10 w-10 lg:h-12 lg:w-12 text-primary"/>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm lg:text-base shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl lg:text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center space-y-8 py-12 lg:py-16">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">今すぐ始めよう</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">YoruMealで今夜の夕食をもっと楽しく、もっと簡単に</p>
          </div>
          <Button asChild size="lg" className="h-12 lg:h-14 px-8 lg:px-12 text-base lg:text-lg">
            <Link href={"/propose"}>
              <Plus />レシピ提案を始める
            </Link>
          </Button>
        </section>
      </div>
    </MainLayout>
  );
}
