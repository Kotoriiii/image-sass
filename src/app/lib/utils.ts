import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 处理静态资源路径，在生产模式下添加basePath前缀
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "";
  return `${basePath}${path}`;
}
