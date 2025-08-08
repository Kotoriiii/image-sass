"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

import { AppDashboardNavSkeleton } from "@/components/feature/Skeletons";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { getAssetPath } from "@/lib/utils";
import { trpcClientReact } from "@/utils/api";

export default function AppDashboardNav({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery();

  const currentApp = apps?.filter((app) => app.id === id)[0];

  if (isPending) {
    return <AppDashboardNavSkeleton />;
  }

  return (
    <div className="flex items-center gap-3">
      <Image src={getAssetPath("/brand-logo.svg")} alt="Image SaaS" width={32} height={32} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">{currentApp ? currentApp.name : "..."}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {apps?.map((app) => {
            return (
              <DropdownMenuItem key={app.id} disabled={app.id === id}>
                <Link href={`/dashboard/apps/${app.id}`} className="w-[100%] text-center">
                  {app.name}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
