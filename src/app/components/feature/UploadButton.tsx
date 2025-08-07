import { useRef } from "react";
import Uppy from "@uppy/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../ui/Button";

export function UploadButton({ uppy }: { uppy: Uppy }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (inputRef.current) {
            inputRef.current.click();
          }
        }}
      >
        <Plus />
      </Button>
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach((file) => {
              // 检查文件类型是否为图片
              if (file.type.startsWith("image/")) {
                uppy.addFile({ name: file.name, data: file });
              } else {
                toast.error(`文件 "${file.name}" 不是图片格式，只支持上传图片文件`);
              }
            });
          }
          e.target.value = "";
        }}
        multiple
        accept="image/*"
        className="fixed left-[-100000px]"
      ></input>
    </>
  );
}
