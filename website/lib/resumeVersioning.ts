import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResumeContent } from "@/types/resume-builder";

const THROTTLE_MS = 10 * 60 * 1000;
const MAX_VERSIONS = 50;

/**
 * Inserts a resume_versions snapshot only when warranted, so autosave
 * (which can fire every couple of seconds) doesn't create hundreds of
 * near-identical rows. A snapshot is skipped entirely if the content is
 * unchanged from the last one; otherwise it's throttled to at most once
 * per THROTTLE_MS unless `force` is set (template switch, restoring an
 * older version). Prunes anything beyond the most recent MAX_VERSIONS.
 */
export async function maybeSnapshotVersion(
  supabase: SupabaseClient,
  resumeId: string,
  content: ResumeContent,
  force = false
): Promise<void> {
  const { data: latest } = await supabase
    .from("resume_versions")
    .select("version_number, content, created_at")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest && JSON.stringify(latest.content) === JSON.stringify(content)) {
    return;
  }

  if (latest && !force) {
    const age = Date.now() - new Date(latest.created_at).getTime();
    if (age < THROTTLE_MS) return;
  }

  const nextVersionNumber = (latest?.version_number ?? 0) + 1;

  const { error } = await supabase.from("resume_versions").insert({
    resume_id: resumeId,
    content,
    version_number: nextVersionNumber,
  });

  if (error) throw error;

  const { data: excess } = await supabase
    .from("resume_versions")
    .select("id")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false })
    .range(MAX_VERSIONS, MAX_VERSIONS + 100);

  if (excess && excess.length > 0) {
    await supabase
      .from("resume_versions")
      .delete()
      .in("id", excess.map((row) => row.id));
  }
}
