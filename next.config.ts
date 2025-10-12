import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath:
    process.env.NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_BASE_PATH}`
      : "",
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  output: "standalone",
  images:{
    loader: "custom",
    loaderFile: './src/app/lib/imageLoader.ts'
  }
};

export default nextConfig;
