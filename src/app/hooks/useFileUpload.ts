import { useEffect, useState } from "react";
import Uppy, { Body, Meta, UppyFile } from "@uppy/core";
import { toast } from "sonner";

import { useUppyState } from "@/hooks/useUppyState";
import { trpcPureClient } from "@/utils/api";

interface UseFileUploadProps {
  uppy: Uppy;
  appId: string;
  queryKey: {
    limit: number;
    orderBy: any;
    appId: string;
  };
  utils: any;
}

export function useFileUpload({ uppy, appId, queryKey, utils }: UseFileUploadProps) {
  const [uploadingFileIDs, setUploadingFileIDs] = useState<string[]>([]);
  const uppyFiles = useUppyState(uppy, (s) => s.files);

  useEffect(() => {
    const handler = (file: UppyFile<Meta, Body> | undefined, resp: NonNullable<UppyFile<Meta, Body>["response"]>) => {
      if (file) {
        trpcPureClient.file.saveFile
          .mutate({
            name: file.data instanceof File ? file.data.name : "test",
            path: resp.uploadURL ?? "",
            type: file.data.type,
            appId,
          })
          .then((resp) => {
            utils.file.infinityQueryFiles.setInfiniteData({ ...queryKey }, (prev: any) => {
              if (!prev) {
                return prev;
              }
              return {
                ...prev,
                pages: prev.pages.map((page: any, index: number) => {
                  if (index === 0) {
                    return {
                      ...page,
                      items: [resp, ...page.items],
                    };
                  }
                  return page;
                }),
              };
            });
          });
      }
    };

    const uploadProgressHandler = (uploadID: string, files: UppyFile<Meta, Body>[]) => {
      setUploadingFileIDs((currentFiles) => [...currentFiles, ...files.map((f) => f.id)]);
    };

    const cancelProgressHandler = () => {
      setUploadingFileIDs([]);
      toast.error("cancel the upload");
    };

    const errorHandler = (error: { name: string; message: string; details?: string }) => {
      setUploadingFileIDs([]);
      // 显示具体的错误信息，如果有的话
      const errorMessage = error?.message || "cannot upload file";
      toast.error(errorMessage);
    };

    const completeHandler = () => {
      setUploadingFileIDs([]);
      toast.success("upload file success");
    };

    uppy.on("upload", uploadProgressHandler);
    uppy.on("cancel-all", cancelProgressHandler);
    uppy.on("error", errorHandler);
    uppy.on("upload-success", handler);
    uppy.on("complete", completeHandler);

    return () => {
      uppy.off("upload-success", handler);
      uppy.off("cancel-all", cancelProgressHandler);
      uppy.off("error", errorHandler);
      uppy.off("upload", uploadProgressHandler);
      uppy.off("complete", completeHandler);
    };
  }, [appId, queryKey, uppy, utils]);

  return {
    uploadingFileIDs,
    uppyFiles,
  };
}
