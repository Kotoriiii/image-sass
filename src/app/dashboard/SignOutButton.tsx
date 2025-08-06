"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/DropdownMenu";

export default function SignOutButton() {
  return (
    <DropdownMenuItem
      onClick={() =>
        signOut({
          callbackUrl:
            process.env.NODE_ENV === "production"
              ? `${process.env.NEXT_PUBLIC_BASE_PATH}/auth/signin`
              : "/auth/signin",
        })
      }
    >
      SignOut
    </DropdownMenuItem>
  );
}
