import Image from "next/image";

import { Skeleton } from "@/components/ui/Skeleton";
import { getAssetPath } from "@/lib/utils";

// Dashboard App List Skeleton
export function AppListSkeleton() {
  return (
    <div className="flex justify-center items-center mx-auto pt-10">
      <div className="flex justify-center items-center w-full max-w-md flex-col gap-2 rounded-md border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-20 h-6" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex w-full max-w-md flex-col gap-2 rounded-md border p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <Skeleton className="w-32 h-6 mb-2" />
                <Skeleton className="w-48 h-4" />
              </div>
              <div>
                <Skeleton className="w-12 h-9" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// App Page Skeleton
export function AppPageSkeleton() {
  return (
    <div className="mx-auto h-full">
      <div className="container flex justify-between items-center h-[60px]">
        <Skeleton className="w-32 h-10" />
        <div className="flex justify-center gap-2">
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-20 h-10" />
          <Skeleton className="w-10 h-10" />
        </div>
      </div>
      <div className="relative h-[calc(100%-60px)]">
        <div className="h-full @container">
          <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4 gap-4 relative container">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 flex flex-col justify-center items-center border p-3">
                <Skeleton className="w-full h-24 mb-2 rounded-md" />
                <Skeleton className="w-2/3 h-3 mb-1" />
                <Skeleton className="w-1/3 h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// App Dashboard Nav Skeleton
export function AppDashboardNavSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Image src={getAssetPath("/brand-logo.svg")} alt="Image SaaS" width={32} height={32} />
      <Skeleton className="w-24 h-9" />
    </div>
  );
}

// API Keys Skeleton
export function ApiKeysSkeleton() {
  return (
    <div className="pt-10">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-32 mb-6" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Key String Skeleton
export function KeyStringSkeleton() {
  return (
    <div className="flex justify-end items-center gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

// Storage Skeleton
export function StorageSkeleton() {
  return (
    <div className="pt-10">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-24 mb-6" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
