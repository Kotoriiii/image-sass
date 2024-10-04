/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath:
    process.env.NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_BASE_PATH}`
      : "",
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
