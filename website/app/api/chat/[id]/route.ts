import { NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const { id } = await params;

    // Ownership check first — a session that doesn't belong to the
    // caller (or doesn't exist) must never leak its messages.
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!session) {
      return new Response("Chat not found.", { status: 404 });
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return Response.json(data);
  } catch (err) {
    console.error(err);

    return new Response("Failed to load chat.", {
      status: 500,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const { id } = await params;

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (sessionError) throw sessionError;

    if (!session) {
      return new Response("Chat not found.", { status: 404 });
    }

    // Delete messages first
    const { error: messagesError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("session_id", id);

    if (messagesError) throw messagesError;

    // Delete session
    const { error: sessionDeleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (sessionDeleteError) throw sessionDeleteError;

    return Response.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return new Response("Failed to delete chat.", {
      status: 500,
    });
  }
}
