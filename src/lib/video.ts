/** Converte links do YouTube/Vimeo em URL de incorporação. Retorna null se não reconhecer. */
export function embedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com") {
      if (u.pathname.startsWith("/embed/")) return `https://www.youtube-nocookie.com${u.pathname}`;
      if (u.pathname.startsWith("/shorts/")) return `https://www.youtube-nocookie.com/embed/${u.pathname.split("/")[2]}`;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
    }
    if (host === "vimeo.com") return `https://player.vimeo.com/video/${u.pathname.split("/").filter(Boolean)[0]}`;
    return null;
  } catch {
    return null;
  }
}

export const isVideoFile = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);
