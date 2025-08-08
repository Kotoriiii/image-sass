import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AppPageSkeleton } from "@/components/feature/Skeletons";
import { getServerSession } from "@/server/auth";
import { serverCaller } from "@/utils/trpc";
import { AppPage as AppPageClient } from "./AppPage";

async function AppPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = await params;

  // 服务端获取session
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // 服务端预取数据
  const caller = serverCaller({ session });
  const apps = await caller.apps.listApps();

  // 预取文件列表数据
  const initialFileData = await caller.file.infinityQueryFiles({
    appId,
    limit: 8,
    cursor: undefined,
  });

  // 转换 Date 对象为字符串以匹配客户端类型
  const serializedFileItems = initialFileData.items.map((item) => ({
    ...item,
    createdAt: item.createdAt?.toISOString() ?? null,
    deletedAt: item.deletedAt?.toISOString() ?? null,
    type: item.type,
  }));

  // 序列化 apps 数据
  const serializedApps =
    apps?.map((app) => ({
      ...app,
      createdAt: app.createdAt?.toISOString() ?? null,
      deletedAt: app.deletedAt?.toISOString() ?? null,
    })) ?? [];

  const currentApp = serializedApps.filter((app) => app.id === appId)[0];

  return (
    <AppPageClient appId={appId} currentApp={currentApp} apps={serializedApps} initialFileData={serializedFileItems} />
  );
}

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AppPageSkeleton />}>
      <AppPageContent params={params} />
    </Suspense>
  );
}
