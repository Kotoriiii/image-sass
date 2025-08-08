"use client";

import { inferRouterOutputs } from "@trpc/server";
import Uppy from "@uppy/core";

import { useFileDelete } from "@/hooks/useFileDelete";
import { useFileQuery } from "@/hooks/useFileQuery";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { cn } from "@/lib/utils";
import { type FilesOrderByColumn } from "@/server/routes/file";
import { AppRouter } from "@/utils/api";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";
import { LocalFileItem, RemoteFileItem } from "./FileItem";
import { CopyUrl, DeleteFile } from "./FileItemAction";

type FileResult = inferRouterOutputs<AppRouter>["file"]["listFiles"];

interface FileListProps {
  uppy: Uppy;
  orderBy: FilesOrderByColumn;
  appId: string;
  onMakeUrl: (id: string) => void;
  initialData?: FileResult;
}

export function FileList({ uppy, orderBy, appId, onMakeUrl, initialData }: FileListProps) {
  // 使用文件查询 hook
  const { fileList, isPending, fetchNextPage, queryKey, utils } = useFileQuery({
    orderBy,
    appId,
    initialData,
  });

  // 使用文件上传 hook
  const { uploadingFileIDs, uppyFiles } = useFileUpload({
    uppy,
    appId,
    queryKey,
    utils,
  });

  // 使用文件删除 hook
  const { handleFileDelete } = useFileDelete({ queryKey, utils });

  // 使用无限滚动 hook
  const { lastElementRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: true,
    isFetchingNextPage: false,
  });

  return (
    <ScrollArea className="h-full @container">
      {isPending && <div className="text-center">Loading</div>}
      <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @2xl:grid-cols-4 gap-4 relative container">
        {uploadingFileIDs.length > 0 &&
          uploadingFileIDs.map((id) => {
            const file = uppyFiles[id];
            return (
              <div key={file.id} className="h-56 flex justify-center items-center border border-red-500">
                <LocalFileItem file={file.data as File}></LocalFileItem>
              </div>
            );
          })}

        {fileList?.map((file) => {
          return (
            <div key={file.id} className="h-56 flex relative justify-center items-center border">
              <div className="inset-0 absolute bg-background/30 opacity-0 hover:opacity-100 transition-all justify-center items-center flex">
                <CopyUrl onClick={() => onMakeUrl(file.id)}></CopyUrl>
                <DeleteFile fileId={file.id} onDeleteSuccess={handleFileDelete}></DeleteFile>
              </div>
              <RemoteFileItem id={file.id} name={file.name}></RemoteFileItem>
            </div>
          );
        })}
      </div>
      <div className={cn("justify-center p-8 hidden", fileList.length > 0 && "flex")} ref={lastElementRef}>
        <Button variant="ghost" onClick={() => fetchNextPage()}>
          Load Next Page
        </Button>
      </div>
    </ScrollArea>
  );
}
