import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'

export async function GET() {
    const supabase = supabaseServer();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` }
    });
    if (error) return NextResponse.redirect(`/error?m=${encodeURIComponent(error.message)}`);
    return NextResponse.redirect(data.url);
  }