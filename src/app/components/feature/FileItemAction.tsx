import { MouseEvent } from "react";
import Uppy from "@uppy/core";
import { Copy, Pause, Play, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { trpcClientReact } from "@/utils/api";
import { Button } from "../ui/Button";

export function DeleteFile({ fileId, onDeleteSuccess }: { fileId: string; onDeleteSuccess: (fileId: string) => void }) {
  const { mutate: deleteFile, isPending } = trpcClientReact.file.deleteFile.useMutation({
    onSuccess() {
      onDeleteSuccess(fileId);
    },
  });

  const handleRemoveFile = () => {
    deleteFile(fileId);
    toast("Delete Succeed!");
  };

  return (
    <Button variant="ghost" onClick={handleRemoveFile} disabled={isPending}>
      <Trash2 />
    </Button>
  );
}

export function CopyUrl({ onClick }: { onClick: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <Button variant="ghost" onClick={onClick}>
      <Copy />
    </Button>
  );
}

export function UploadAllButton({
  uppy,
  isUploading,
  onUploadComplete,
}: {
  uppy: Uppy;
  isUploading: boolean;
  onUploadComplete?: () => void;
}) {
  const handleUploadAll = () => {
    uppy
      .upload()
      .then(() => {
        onUploadComplete?.();
      })
      .catch(() => {
        onUploadComplete?.();
      });
  };

  return (
    <Button onClick={handleUploadAll} disabled={isUploading}>
      Upload All
    </Button>
  );
}

export function PauseResumeButton({
  uppy,
  isPaused,
  onPauseChange,
}: {
  uppy: Uppy;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
}) {
  const handleTogglePause = () => {
    if (isPaused) {
      uppy.resumeAll();
      onPauseChange(false);
    } else {
      uppy.pauseAll();
      onPauseChange(true);
    }
  };

  return (
    <Button onClick={handleTogglePause} variant="outline">
      {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
      {isPaused ? "Resume" : "Pause"}
    </Button>
  );
}

export function CancelUploadButton({ uppy, onCancel }: { uppy: Uppy; onCancel?: () => void }) {
  const handleCancel = () => {
    uppy.cancelAll();
    onCancel?.();
  };

  return (
    <Button onClick={handleCancel} variant="destructive">
      <X className="w-4 h-4 mr-2" />
      Cancel
    </Button>
  );
}
