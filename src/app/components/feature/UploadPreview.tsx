"use client";

import { useState } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";
import Uppy from "@uppy/core";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/Dialog";
import { Progress } from "@/components/ui/Progress";
import { useUppyState } from "@/dashboard/useUppyState";
import { LocalFileItem } from "./FileItem";

export function UploadPreview({ uppy }: { uppy: Uppy }) {
  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const totalProgress = useUppyState(uppy, (s) => s.totalProgress);
  const isUploading = useUppyState(uppy, (s) => s.totalProgress > 0 && s.totalProgress < 100);
  const open = files.length > 0;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const file = files[index];
  const percentage = file?.progress?.percentage || 0;

  const clearFileList = () => {
    files.map((file) => {
      uppy.removeFile(file.id);
    });
    setIndex(0);
  };

  const clear = () => {
    if (totalProgress !== 100) {
      uppy.cancelAll();
    }
    clearFileList();
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
          <div key={file.id} className="w-56 h-56 flex flex-col justify-center items-center gap-2">
            <LocalFileItem file={file.data as File}></LocalFileItem>
            {percentage > 0 && <Progress value={percentage} className="min-h-2"></Progress>}
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
          {isUploading && (
            <Button
              onClick={() => {
                if (isPaused) {
                  uppy.resumeAll();
                  setIsPaused(false);
                } else {
                  uppy.pauseAll();
                  setIsPaused(true);
                }
              }}
              variant="outline"
            >
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button
            onClick={() => {
              uppy
                .upload()
                .then(() => {
                  clearFileList();
                })
                .catch(() => {
                  clearFileList();
                });
            }}
            disabled={isUploading}
          >
            Upload All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
}
