import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppListSkeleton } from "@/components/feature/Skeletons";
import { Button } from "@/components/ui/Button";
import { getAssetPath } from "@/lib/utils";
import { getServerSession } from "@/server/auth";
import { serverCaller } from "@/utils/trpc";

async function AppListContent() {
  // 服务端获取session
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // 服务端预取数据
  const caller = serverCaller({ session });
  const apps = await caller.apps.listApps();

  // 如果没有应用，直接重定向
  if (apps.length === 0) {
    redirect("/dashboard/apps/new");
  }

  return (
    <div className="flex justify-center items-center mx-auto pt-10">
      <div className="flex justify-center items-center w-full max-w-md flex-col gap-2 rounded-md border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image src={getAssetPath("/logo.svg")} alt="Image SaaS" width={32} height={32} />
          <h1 className="text-xl font-semibold">App List</h1>
        </div>
        {apps.map((app) => (
          <div key={app.id} className="flex w-full max-w-md flex-col gap-2 rounded-md border p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="text-xl">{app.name}</h2>
                <p className="text-base-content/60">{app.description ? app.description : "(no description)"}</p>
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<AppListSkeleton />}>
      <AppListContent />
    </Suspense>
  );
}
