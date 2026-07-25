import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase.storage
    .from("uploads")
    .list("", {
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  if (error) {
    return Response.json([]);
  }

  return Response.json(data.map((f) => f.name));
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return Response.json(
        { error: "File name is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase.storage
      .from("uploads")
      .remove([fileName]);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch {
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}