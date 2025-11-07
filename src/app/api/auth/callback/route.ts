import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const email = requestUrl.searchParams.get("email");

  // マジックリンクの場合
  if (token && type === "magiclink" && email) {
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

    // マジックリンクトークンを検証してセッションを確立
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "magiclink",
    });

    if (error) {
      return NextResponse.redirect(new URL(`/error?m=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}