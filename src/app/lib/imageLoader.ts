export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("/image/") || src.includes("/image/")) {
    return src;
  }

  return `${src}?w=${width}&q=${quality || 75}`;
}
