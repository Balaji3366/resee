function toEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

/**
 * Renders a lesson's video_url as either a YouTube/Vimeo embed or a
 * direct <video> element, whichever the URL matches. `lessons.video_url`
 * has existed since supabase/migrations/0006_admin_panel.sql, but no
 * learner-facing player consumed it until now.
 */
export default function LessonVideoPlayer({ url }: { url: string }) {
  const embedUrl = toEmbedUrl(url);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber/20 bg-black">
      <div className="aspect-video w-full">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Lesson video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video controls className="h-full w-full" src={url}>
            Your browser doesn&apos;t support embedded video.
          </video>
        )}
      </div>
    </div>
  );
}
