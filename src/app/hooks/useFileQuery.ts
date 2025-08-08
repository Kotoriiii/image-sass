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
  } = trpcClientReact.file.infinityQueryFiles.useInfiniteQuery(
    { ...queryKey },
    {
      getNextPageParam: (resp) => resp.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      initialData: initialData
        ? {
            pages: [
              {
                items: initialData,
                nextCursor: null,
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
    queryKey,
    utils,
  };
}
