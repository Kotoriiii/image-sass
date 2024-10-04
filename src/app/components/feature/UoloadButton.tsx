import Uppy from "@uppy/core";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { useRef } from "react";

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
              uppy.addFile({ data: file });
            });
          }
          e.target.value = "";
        }}
        multiple
        className="fixed left-[-100000px]"
      ></input>
    </>
  );
}
