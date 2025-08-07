import { HTMLAttributes, ReactNode, useRef, useState } from "react";
import Uppy from "@uppy/core";
import { toast } from "sonner";

export function Dropzone({
  uppy,
  children,
  ...divProps
}: {
  uppy: Uppy;
  children: ReactNode | ((draging: boolean) => ReactNode);
} & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <div
      {...divProps}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        timerRef.current = setTimeout(() => {
          setDragging(false);
        }, 50);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
          // 检查文件类型是否为图片
          if (file.type.startsWith("image/")) {
            uppy.addFile({
              name: file.name,
              data: file,
            });
          } else {
            toast.error(`文件 "${file.name}" 不是图片格式，只支持上传图片文件`);
          }
        });
        setDragging(false);
      }}
    >
      {typeof children === "function" ? children(dragging) : children}
    </div>
  );
}
