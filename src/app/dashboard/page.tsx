"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trpcClientReact } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

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
    <div className="flex justify-center items-center mx-auto pt-10">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Image src="/loading-icon.svg" alt="Loading" width={40} height={40} />
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className=" flex justify-center items-center w-full max-w-md flex-col gap-2 rounded-md border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image src="/logo.svg" alt="Image SaaS" width={32} height={32} />
            <h1 className="text-xl font-semibold">应用列表</h1>
          </div>
          {apps?.map(app => (
            <div
              key={app.id}
              className=" flex w-full max-w-md flex-col gap-2 rounded-md border p-6"
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl">{app.name}</h2>
                  <p className="text-base-content/60">
                    {app.description ? app.description : "(no description)"}
                  </p>
                </div>
                <div>
                  <Button asChild>
                    <Link href={`/dashboard/apps/${app.id}`}>Go</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
