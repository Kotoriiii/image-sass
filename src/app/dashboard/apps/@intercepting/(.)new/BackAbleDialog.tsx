"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/ui/Dialog";

export default function BackAbleDialog({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={() => {
        router.back();
      }}
    >
      {children}
    </Dialog>
  );
}
