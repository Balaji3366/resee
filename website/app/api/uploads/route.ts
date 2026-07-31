import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("uploads").upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      filename: fileName,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
