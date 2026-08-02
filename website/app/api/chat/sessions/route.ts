import { getServerSupabase } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Bare-array contract preserved even on auth failure — the caller
      // (AIChat.tsx) always does res.json() unconditionally and expects
      // an array to .map() over.
      return Response.json([], { status: 401 });
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error(error);

    return Response.json([], { status: 500 });
  }
}
