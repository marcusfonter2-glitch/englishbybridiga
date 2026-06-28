import { supabase } from "@/integrations/supabase/client";

/** Convert a video_url (storage path or external URL) into an embeddable URL. */
export async function resolveVideoUrl(videoUrl: string | null | undefined): Promise<string | null> {
  if (!videoUrl) return null;
  if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
    return videoUrl;
  }
  // storage path
  const { data } = await supabase.storage.from("lesson-videos").createSignedUrl(videoUrl, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function resolveThumbUrl(thumb: string | null | undefined): Promise<string | null> {
  if (!thumb) return null;
  if (thumb.startsWith("http")) return thumb;
  const { data } = await supabase.storage.from("lesson-thumbnails").createSignedUrl(thumb, 60 * 60);
  return data?.signedUrl ?? null;
}

export function isYoutube(url: string) {
  return /youtu\.?be/.test(url);
}
export function isVimeo(url: string) {
  return /vimeo\.com/.test(url);
}
export function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
export function vimeoEmbed(url: string) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : url;
}
