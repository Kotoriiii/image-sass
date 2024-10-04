"use client";

import { BreadCrumb } from "../breadcrumb";

export default function AppDashboardNav({
  params: { id },
}: {
  params: { id: string };
}) {

  return (
    <div className="flex justify-between items-center">
      <BreadCrumb id={id} leaf="Storage"></BreadCrumb>
    </div>
  );
}
