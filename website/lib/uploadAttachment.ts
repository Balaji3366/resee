import { supabase } from "@/lib/supabase";

export async function uploadAttachment(file: File) {
  const fileExt = file.name.split(".").pop();

  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const filePath = fileName;

  const { error } = await supabase.storage
    .from("attachments")
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("attachments")
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}