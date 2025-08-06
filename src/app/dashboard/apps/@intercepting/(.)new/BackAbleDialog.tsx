"use client";

import { Dialog } from "@/components/ui/Dialog";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

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
