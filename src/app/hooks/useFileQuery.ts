import { useMemo } from "react";
import { inferRouterOutputs } from "@trpc/server";

import { type FilesOrderByColumn } from "@/server/routes/file";
import { AppRouter, trpcClientReact } from "@/utils/api";

type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

interface UseFileQueryProps {
  orderBy: FilesOrderByColumn;
  appId: string;
  initialData?: FileResult;
}

export function useFileQuery({ orderBy, appId, initialData }: UseFileQueryProps) {
  const queryKey = useMemo(
    () => ({
      limit: 5,
      orderBy,
      appId,
    }),
    [orderBy, appId]
  );

  const {
    data: infinityQueryData,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpcClientReact.file.infinityQueryFiles.useInfiniteQuery(
    { ...queryKey },
    {
      getNextPageParam: (resp) => {
        // 只有当返回的数据量等于limit时，才认为还有下一页
        return resp.items.length === queryKey.limit ? resp.nextCursor : undefined;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      initialData: initialData
        ? {
            pages: [
              {
                items: initialData,
                nextCursor:
                  initialData.length === queryKey.limit
                    ? {
                        createdAt: initialData[initialData.length - 1]?.createdAt || new Date().toISOString(),
                        id: initialData[initialData.length - 1]?.id || "",
                      }
                    : null,
              },
            ],
            pageParams: [undefined],
          }
        : undefined,
    }
  );

  const fileList = infinityQueryData
    ? infinityQueryData.pages.reduce((result, page) => {
        return [...result, ...page.items];
      }, [] as FileResult)
    : [];

  const utils = trpcClientReact.useUtils();

  return {
    fileList,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    queryKey,
    utils,
  };
}
