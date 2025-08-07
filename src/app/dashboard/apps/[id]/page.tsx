"use client";

import { ReactNode, use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DialogDescription } from "@radix-ui/react-dialog";
import { MoveDown, MoveUp, Settings } from "lucide-react";

import { Dropzone } from "@/components/feature/Dropzone";
import { FileList } from "@/components/feature/FileList";
import { UploadButton } from "@/components/feature/UploadButton";
import { UploadPreview } from "@/components/feature/UploadPreview";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { usePasteFile } from "@/hooks/usePasteFile";
import { useUppy } from "@/hooks/useUppy";
import { type FilesOrderByColumn } from "@/server/routes/file";
import { trpcClientReact } from "@/utils/api";
import { UrlMaker } from "./UrlMaker";

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: appId } = use(params);
  const [makingUrlImageId, setMakingUrlImageId] = useState<string | null>(null);

  const [orderBy, setOrderBy] = useState<Exclude<FilesOrderByColumn, undefined>>({
    field: "createdAt",
    order: "desc",
  });

  const { data: apps, isPending } = trpcClientReact.apps.listApps.useQuery(void 0, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const currentApp = apps?.filter((app) => app.id === appId)[0];

  const uppy = useUppy(appId);

  usePasteFile({
    onFilesPaste: (files) => {
      uppy.addFiles(files.map((file) => ({ name: file.name, data: file })));
    },
  });

  let children: ReactNode;

  if (isPending) {
    children = (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Image src="/loading-icon.svg" alt="Loading" width={40} height={40} />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  } else if (!currentApp) {
    children = (
      <div className="flex flex-col mt-10 p-4 border rounded-md max-w-48 mx-auto items-center">
        <p className="text-lg">App Not Exist</p>
        <p className="text-sm">Choose another one</p>
        <div className="flex flex-col gap-4 items-center">
          {apps?.map((app) => (
            <Button key={app.id} asChild variant="link">
              <Link href={`/dashboard/apps/${app.id}`}>{app.name}</Link>
            </Button>
          ))}
        </div>
      </div>
    );
  } else {
    children = (
      <div className="mx-auto h-full">
        <div className="container flex justify-between items-center h-[60px]">
          <Button
            onClick={() => {
              setOrderBy((current) => ({
                ...current,
                order: current?.order === "asc" ? "desc" : "asc",
              }));
            }}
          >
            Created At {orderBy.order === "desc" ? <MoveUp /> : <MoveDown />}
          </Button>
          <div className="flex justify-center gap-2">
            <UploadButton uppy={uppy}></UploadButton>
            <Button asChild>
              <Link href="./new">new app</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/apps/${appId}/setting/storage`}>
                <Settings></Settings>
              </Link>
            </Button>
          </div>
        </div>

        <Dropzone uppy={uppy} className=" relative h-[calc(100%-60px)]">
          {(draging) => {
            return (
              <>
                {draging && (
                  <div className=" absolute inset-0 bg-secondary/50 z-10 flex flex-col justify-center items-center gap-4">
                    <Image src="/upload-icon.svg" alt="Upload" width={48} height={48} />
                    <p className="text-2xl font-semibold text-black">Drag files here to upload</p>
                  </div>
                )}
                <FileList
                  appId={appId}
                  uppy={uppy}
                  orderBy={orderBy}
                  onMakeUrl={(id) => setMakingUrlImageId(id)}
                ></FileList>
              </>
            );
          }}
        </Dropzone>
        <UploadPreview uppy={uppy}></UploadPreview>
        <Dialog
          open={Boolean(makingUrlImageId)}
          onOpenChange={(flag) => {
            if (flag === false) {
              setMakingUrlImageId(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogDescription className="hidden">make url</DialogDescription>
            <DialogTitle>Make Url</DialogTitle>
            {makingUrlImageId && <UrlMaker id={makingUrlImageId}></UrlMaker>}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return children;
}
