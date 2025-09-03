import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function GET() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect("/");
}