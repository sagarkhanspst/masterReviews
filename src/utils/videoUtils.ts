/**
 * Extracts embeddable YouTube URL from watch/short/share links
 */
export function getEmbedVideoUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }
  
  // standard watch?v=
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&autoplay=0`;
  }

  // fallback for direct video or other
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}
