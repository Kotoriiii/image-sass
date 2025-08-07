import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { db } from "@/server/db/db";
import S3ClientSingleton from "@/server/S3ClientSingleton";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await db.query.files.findFirst({
    where: (files, { eq }) => eq(files.id, id),
    with: {
      app: {
        with: {
          storage: true,
        },
      },
    },
  });

  if (!file?.app.storage) {
    return new NextResponse("", {
      status: 400,
    });
  }

  if (!file || !file.contentType.startsWith("image")) {
    return new NextResponse("", {
      status: 400,
    });
  }

  const storage = file.app.storage;

  const s3Params: GetObjectCommandInput = {
    Bucket: storage.configuration.bucket,
    Key: file.path,
  };

  const s3Client = S3ClientSingleton.getInstance({
    apiEndpoint: storage.configuration.apiEndpoint,
    region: storage.configuration.region,
    accessKeyId: storage.configuration.accessKeyId,
    secretAccessKey: storage.configuration.secretAccessKey,
  });

  const command = new GetObjectCommand(s3Params);
  const response = await s3Client.send(command);

  const byteArray = await response.Body?.transformToByteArray();

  if (!byteArray) {
    return new NextResponse("", {
      status: 400,
    });
  }

  const image = sharp(byteArray);

  const query = new URL(request.url).searchParams;

  const width = query.get("width") ? parseInt(query.get("width")!) : 250;

  image.resize({
    width: width,
  });

  let rotate = parseInt(query.get("rotate") || "");

  rotate = rotate || 0;

  image.rotate(rotate);

  const buffer = await image.webp().toBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
