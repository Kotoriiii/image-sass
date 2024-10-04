/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Uppy, {
  GenericEventCallback,
  UploadCallback,
  UploadSuccessCallback,
} from "@uppy/core";
import { useUppyState } from "@/dashboard/useUppyState";
import { trpcClientReact, trpcPureClient, AppRouter } from "@/utils/api";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { inferRouterOutputs } from "@trpc/server";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";
import { type FilesOrderByColumn } from "@/server/routes/file";
import { CopyUrl, DeleteFile } from "./FileItemAction";

type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

export function FileList({
  uppy,
  orderBy,
  appId,
  onMakeUrl,
}: {
  uppy: Uppy;
  orderBy: FilesOrderByColumn;
  appId: string;
  onMakeUrl: (id: string) => void;
}) {
  const queryKey = {
    limit: 5,
    orderBy,
    appId,
  };

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
    }
  );

  const fileList = infinityQueryData
    ? infinityQueryData.pages.reduce((result, page) => {
        return [...result, ...page.items];
      }, [] as FileResult)
    : [];

  const utils = trpcClientReact.useUtils();

  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  useEffect(() => {
    const handler: UploadSuccessCallback<{}> = (file, resp) => {
      if (file) {
        trpcPureClient.file.saveFile
          .mutate({
            name: file.data instanceof File ? file.data.name : "test",
            path: resp.uploadURL ?? "",
            type: file.data.type,
            appId,
          })
          .then((resp) => {
            utils.file.infinityQueryFiles.setInfiniteData(
              { ...queryKey },
              (prev) => {
                if (!prev) {
                  return prev;
                }
                return {
                  ...prev,
                  pages: prev.pages.map((page, index) => {
                    if (index === 0) {
                      return {
                        ...page,
                        items: [resp, ...page.items],
                      };
                    }
                    return page;
                  }),
                };
              }
            );
          });
      }
    };

    const uploadProgressHandler: UploadCallback = (data) => {
      setUploadingFileIDs((currentFiles) => [...currentFiles, ...data.fileIDs]);
    };

    const cancelProgressHandler: GenericEventCallback = () => {
      setUploadingFileIDs([]);
    };

    const completeHandler = () => {
      setUploadingFileIDs([]);
    };

    uppy.on("upload", uploadProgressHandler);

    uppy.on("cancel-all", cancelProgressHandler);

    uppy.on("upload-success", handler);

    uppy.on("complete", completeHandler);

    return () => {
      uppy.off("upload-success", handler);
      uppy.off("upload", uploadProgressHandler);
      uppy.off("complete", completeHandler);
    };
  }, [uppy, utils]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      const observer = new IntersectionObserver(
        (e) => {
          if (e[0].intersectionRatio > 0.1) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.1,
        }
      );

      observer.observe(bottomRef.current);

      const element = bottomRef.current;

      return () => {
        observer.unobserve(element);
        observer.disconnect();
      };
    }
  }, [fetchNextPage]);

  const handleFileDelete = (id: string) => {
    utils.file.infinityQueryFiles.setInfiniteData({ ...queryKey }, (prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        pages: prev.pages.map((page) => {
          const hasId = page.items.some((item) => item.id === id);
          if (hasId) {
            return {
              ...page,
              items: page.items.filter((item) => item.id !== id),
            };
          }
          return page;
        }),
      };
    });
  };

  return (
    <ScrollArea className="h-full @container">
      {isPending && <div className="text-center">Loading</div>}
      <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4 gap-4 relative container">
        {uploadingFileIDs.length > 0 &&
          uploadingFileIDs.map((id) => {
            const file = uppyFiles[id];
            return (
              <div
                key={file.id}
                className="h-56 flex justify-center items-center border border-red-500"
              >
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })}

        {fileList?.map((file) => {
          return (
            <div
              key={file.id}
              className="h-56 flex relative justify-center items-center border"
            >
              <div className="inset-0 absolute bg-background/30 opacity-0 hover:opacity-100 transition-all justify-center items-center flex">
                <CopyUrl onClick={() => onMakeUrl(file.id)}></CopyUrl>
                <DeleteFile
                  fileId={file.id}
                  onDeleteSuccess={handleFileDelete}
                ></DeleteFile>
              </div>
              <RemoteFileItem
                contentType={file.contentType}
                id={file.id}
                name={file.name}
              ></RemoteFileItem>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          "justify-center p-8 hidden",
          fileList.length > 0 && "flex"
        )}
        ref={bottomRef}
      >
        <Button variant="ghost" onClick={() => fetchNextPage()}>
          Load Next Page
        </Button>
      </div>
    </ScrollArea>
  );
}
