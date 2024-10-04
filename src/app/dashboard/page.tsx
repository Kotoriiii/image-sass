"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpcClientReact } from "@/utils/api";
import { Button } from "@/components/ui/Button";

export default function DashboardAppList() {
  const getAppsResult = trpcClientReact.apps.listApps.useQuery(void 0, {
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const router = useRouter();

  const { data: apps, isLoading } = getAppsResult;

  useEffect(() => {
    if (apps && apps.length === 0) {
      toast("Create Your First App");
      router.push("/dashboard/apps/new");
    }
  }, [apps, router]);

  return (
    <div className=" w-fit mx-auto pt-10">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className=" flex w-full max-w-md flex-col gap-2 rounded-md border p-2">
          {apps?.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between gap-6"
            >
              <div>
                <h2 className="text-xl">{app.name}</h2>
                <p className="text-base-content/60">
                  {app.description ? app.description : "(no description)"}
                </p>
              </div>
              <div>
                <Button asChild variant="destructive">
                  <Link href={`/dashboard/apps/${app.id}`}>Go</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
