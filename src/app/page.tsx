import { supabaseServer } from "./lib/supabaseServer";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      <section className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-2">LLMで提案</h2>
          <p className="text-sm opacity-80">
            使いたくない食材を入力、使える調理器具を選ぶだけ。
          </p>
        </div>
        <div className="border rounded-2xl p-5 shadow">
        <h2 className="font-semibold mb-2">買い物が楽</h2>
          <p className="text-sm opacity-80">
            不足分だけの買い物リストを自動生成。スマホでチェックしながら購入。
          </p>
        </div>
        <div className="border rounded-2xl p-5 shadow">
        <h2 className="font-semibold mb-2">保存・再利用</h2>
          <p className="text-sm opacity-80">
            気に入ったレシピは保存。後から一覧表示してすぐ作れる。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold">はじめから</h3>
        <ol className="list-decimal pl-5 text-sm opacity-85 space-y-1">
          <li>右上の「GitHubでログイン」をクリック</li>
          <li>「提案」から除外食材・器具を入力してレシピ生成</li>
          <li>気に入ったら「このレシピを保存」→「保存一覧」「買い物リスト」へ</li>
        </ol>
      </section>

      <footer className="pt-6 border-t text-sm opacity-70">
          (c) {new Date().getFullYear()} yoru-meal
      </footer>
    </main>
  );
}
