import { MouseEvent } from "react";
import { Copy, Trash2 } from "lucide-react";
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
