import { supabase } from "@/lib/supabase";

export interface UploadResult {
  path: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Generalizes lib/uploadAttachment.ts (one hardcoded bucket, flat
 * filename, no delete/list, no user-scoping) into a reusable service.
 * The original stays in place and working — its one call site is not
 * migrated in this pass.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  options: { userId?: string } = {}
): Promise<UploadResult> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const path = options.userId ? `${options.userId}/${fileName}` : fileName;

  const { error } = await supabase.storage.from(bucket).upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path, url: data.publicUrl, name: file.name, type: file.type, size: file.size };
}

export async function removeFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function listFiles(bucket: string, folder = "") {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;

  return data;
}

export function getPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
