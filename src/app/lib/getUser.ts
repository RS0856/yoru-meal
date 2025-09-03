import { supabaseServer } from "./supabaseServer";


export async function getUser() {
    const supabase = supabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { user: null, error };
    return { user, error:null };
}