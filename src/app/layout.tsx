import type { Metadata } from "next";
import { TRPCProvider } from "./TrpcProvider";
import { Toaster } from "./components/ui/Sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image SaaS - Smart Image Processing Platform",
  description:
    "Modern image processing SaaS platform providing upload, storage, processing and API services",
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
