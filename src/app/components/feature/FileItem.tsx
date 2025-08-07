import { useMemo } from "react";
import Image from "next/image";

export function FileItem({ url, name }: { url: string; name: string }) {
  return <Image src={url} alt={name} className="w-[100%] h-[100%] object-contain" width={800} height={600} />;
}

export function LocalFileItem({ file }: { file: File }) {
  const url = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  return <FileItem url={url} name={file.name}></FileItem>;
}
export function RemoteFileItem({ name, id }: { name: string; id: string }) {
  return <FileItem url={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/image/${id}`} name={name}></FileItem>;
}
