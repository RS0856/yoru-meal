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

  // codeパラメータがある場合（Supabaseのマジックリンクはcodeを使用）
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          new URL(`/error?m=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }
    } catch (err) {
      return NextResponse.redirect(
        new URL(`/error?m=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`, requestUrl.origin)
      );
    }
  }
  // マジックリンクの場合 - token_hashまたはtokenを使用（旧形式）
  else if ((token || tokenHash) && type === "magiclink") {
    const verifyToken = tokenHash || token;
    
    if (!verifyToken) {
      return NextResponse.redirect(
        new URL(`/error?m=${encodeURIComponent("トークンが見つかりません")}`, requestUrl.origin)
      );
    }

    try {
      // emailがある場合はVerifyEmailOtpParams型を使用
      if (email) {
        const { error } = await supabase.auth.verifyOtp({
          token: verifyToken,
          type: "magiclink",
          email: email,
        });

        if (error) {
          return NextResponse.redirect(
            new URL(`/error?m=${encodeURIComponent(error.message)}`, requestUrl.origin)
          );
        }
      } else {
        // emailがない場合はtoken_hashを使用（VerifyTokenHashParams型）
        // token_hashの場合はtypeを指定しない
        const { error } = await supabase.auth.verifyOtp({
          token_hash: verifyToken,
          type: "magiclink",
        });

        if (error) {
          return NextResponse.redirect(
            new URL(`/error?m=${encodeURIComponent(error.message)}`, requestUrl.origin)
          );
        }
      }
    } catch (err) {
      return NextResponse.redirect(
        new URL(`/error?m=${encodeURIComponent(err instanceof Error ? err.message : "Unknown error")}`, requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}