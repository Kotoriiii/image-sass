import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/server/db/db";

export async function GET(
  request: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
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

  const storage = file.app.storage.configuration;

  const params: GetObjectCommandInput = {
    Bucket: storage.bucket,
    Key: file.path,
  };

  const s3Client = new S3Client({
    endpoint: storage.apiEndpoint,
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
  });

  const command = new GetObjectCommand(params);
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

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
