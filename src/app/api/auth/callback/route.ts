import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const email = requestUrl.searchParams.get("email");

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  );

  // codeパラメータがある場合（SupabaseのPKCEフロー）
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }
    } catch (err) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(err instanceof Error ? err.message : "認証に失敗しました")}`, requestUrl.origin)
      );
    }
  }
  // マジックリンクまたはサインアップメールの場合 - token_hashまたはtokenを使用
  else if (token || tokenHash) {
    const verifyToken = tokenHash || token;
    
    if (!verifyToken) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("トークンが見つかりません")}`, requestUrl.origin)
      );
    }

    try {
      // typeに応じて処理を分岐
      // magiclink: 既存ユーザーのログイン
      // signup または email: 新規ユーザーのサインアップ確認
      const otpType = type === "magiclink" ? "magiclink" : type === "signup" ? "signup" : type === "email" ? "email" : "magiclink";
      
      // emailがある場合はVerifyEmailOtpParams型を使用
      if (email) {
        const { error } = await supabase.auth.verifyOtp({
          token: verifyToken,
          type: otpType as "magiclink" | "signup" | "email",
          email: email,
        });

        if (error) {
          return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
          );
        }
      } else {
        // emailがない場合はtoken_hashを使用（VerifyTokenHashParams型）
        const { error } = await supabase.auth.verifyOtp({
          token_hash: verifyToken,
          type: otpType as "magiclink" | "signup" | "email",
        });

        if (error) {
          return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
          );
        }
      }
    } catch (err) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(err instanceof Error ? err.message : "認証に失敗しました")}`, requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
