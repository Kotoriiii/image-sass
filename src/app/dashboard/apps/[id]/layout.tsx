import { redirect } from "next/navigation";

import { getServerSession } from "@/server/auth";
import { db } from "@/server/db/db";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  const { id } = await params;

  const app = await db.query.apps.findFirst({
    where: (apps, { eq }) => eq(apps.id, id),
  });

  if (session?.user.id !== app?.userId) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
