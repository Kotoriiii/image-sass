/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useMemo } from "react";

export function FileItem({
  url,
  name,
  isImage,
}: {
  url: string;
  name: string;
  isImage: boolean;
}) {
  return isImage ? (
    <img src={url} alt={name} className="w-[100%] h-[100%] object-contain" />
  ) : (
    <Image
      src="/unknown-file-types.png"
      alt="unknow file type"
      width={100}
      height={100}
    ></Image>
  );
}

export function LocalFileItem({ file }: { file: File }) {
  const isImage = file.type.startsWith("image");

  const url = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return "";
  }, [isImage, file]);

  return <FileItem isImage={isImage} url={url} name={file.name}></FileItem>;
}
export function RemoteFileItem({
  contentType,
  name,
  id,
}: {
  contentType: string;
  name: string;
  id: string;
}) {
  const isImage = contentType.startsWith("image");

  return (
    <FileItem
      isImage={isImage}
      url={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/image/${id}`}
      name={name}
    ></FileItem>
  );
}
