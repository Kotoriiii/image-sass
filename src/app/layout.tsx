import type { Metadata } from "next";
import { TRPCProvider } from "./TrpcProvider";
import { Toaster } from "./components/ui/Sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image SaaS - 智能图片处理平台",
  description: "现代化图片处理SaaS平台，提供图片上传、存储、处理和API服务",
  icons: {
    icon: "/icon.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster></Toaster>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
