import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import sharp from "sharp";

import { getServerSession } from "@/server/auth";
import { db } from "@/server/db/db";
import S3ClientSingleton from "@/server/S3ClientSingleton";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const query = new URL(request.url).searchParams;
  const width = query.get("width") ? parseInt(query.get("width")!) : 250;
  const rotate = query.get("rotate") ? parseInt(query.get("rotate")!) : 0;

  const hash = crypto.createHash("md5");
  hash.update(`${id}-${width}-${rotate}`);
  const etag = `${hash.digest("hex")}`;

  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

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

  if (!file || !file.contentType.startsWith("image")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const hasPermission = file.userId === session.user.id || file.app.userId === session.user.id;
  if (!hasPermission) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!file.app.storage) {
    return new NextResponse("Storage not configured", {
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
    return new NextResponse("Failed to fetch image", {
      status: 400,
    });
  }

  const image = sharp(byteArray);

  image.resize({
    width: width,
  });

  image.rotate(rotate);

  const accept = request.headers.get("Accept");
  let buffer: Buffer;
  let contentType: string;

  if (accept?.includes("image/webp")) {
    buffer = await image.webp().toBuffer();
    contentType = "image/webp";
  } else if (accept?.includes("image/jpeg")) {
    buffer = await image.jpeg().toBuffer();
    contentType = "image/jpeg";
  } else {
    buffer = await image.png().toBuffer();
    contentType = "image/png";
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      Vary: "Accept",
    },
  });
}
