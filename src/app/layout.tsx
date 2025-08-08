import type { Metadata } from "next";

import { Toaster } from "./components/ui/Sonner";
import { TRPCProvider } from "./TrpcProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Image SaaS - Smart Image Processing Platform",
  description: "Modern image processing SaaS platform providing upload, storage, processing and API services",
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
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body>
        <Toaster></Toaster>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
