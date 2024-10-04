/* eslint-disable @next/next/no-img-element */
import Uppy from "@uppy/core";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useUppyState } from "@/dashboard/useUppyState";
import { LocalFileItem } from "./FileItem";
import { DialogDescription } from "@radix-ui/react-dialog";

export function UploadPreview({ uppy }: { uppy: Uppy }) {
  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const totalProgress = useUppyState(uppy, (s) => s.totalProgress);
  const open = files.length > 0;

  const [index, setIndex] = useState(0);

  const file = files[index];
  const percentage = file?.progress?.percentage || 0;

  const clear = () => {
    if (totalProgress !== 100) {
      uppy.cancelAll();
    }
    files.map((file) => {
      uppy.removeFile(file.id);
    });
    setIndex(0);
  };

  return file ? (
    <Dialog
      open={open}
      onOpenChange={(flag) => {
        if (flag === false) {
          clear();
        }
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogDescription className="hidden">upload preview</DialogDescription>
        <DialogTitle>Upload Preview</DialogTitle>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (index === 0) {
                setIndex(files.length - 1);
              } else {
                setIndex(index - 1);
              }
            }}
          >
            <ChevronLeft />
          </Button>
          <div
            key={file.id}
            className="w-56 h-56 flex flex-col justify-center items-center gap-4"
          >
            <LocalFileItem file={file.data as File}></LocalFileItem>
            {percentage > 0 && <Progress value={percentage}></Progress>}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              if (index === files.length - 1) {
                setIndex(0);
              } else {
                setIndex(index + 1);
              }
            }}
          >
            <ChevronRight />
          </Button>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              uppy.removeFile(file.id);
              if (index === files.length - 1) {
                setIndex(files.length - 2);
              }
            }}
            variant="destructive"
          >
            Delete This
          </Button>
          <Button
            onClick={() => {
              uppy.upload().then(() => {
                clear();
              });
            }}
          >
            Upload All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
}
