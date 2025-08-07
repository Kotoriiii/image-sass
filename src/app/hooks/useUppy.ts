import { useState } from "react";
import awsS3 from "@uppy/aws-s3";
import Uppy from "@uppy/core";

import { trpcPureClient } from "@/utils/api";

export function useUppy(appId: string) {
  const [uppy] = useState(() => {
    const uppy = new Uppy();
    uppy.use(awsS3, {
      limit: 6, // 并行上传的块数限制
      shouldUseMultipart(file) {
        // 如果文件大小超过 10MB，使用多部分上传
        return (file.size ?? 0) > 10 * 2 ** 20;
      },
      async createMultipartUpload(file) {
        const result = await trpcPureClient.file.createMultipartUpload.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size ?? 0,
          appId,
        });
        if (!result.uploadId || !result.key) {
          throw new Error("Failed to create multipart upload");
        }
        return {
          uploadId: result.uploadId,
          key: result.key,
        };
      },
      async listParts(file, { uploadId, key }) {
        // 返回 MaybePromise<AwsS3Part[]>
        const result = await trpcPureClient.file.listMultipartParts.mutate({
          uploadId: uploadId!,
          key: key!,
          appId,
        });
        return result.parts.map((part) => ({
          PartNumber: part.PartNumber || 0,
          ETag: part.ETag || "", // 确保 ETag 是字符串
          Size: part.Size || 0,
        }));
      },
      async signPart(file, { uploadId, key, partNumber }) {
        // 返回 MaybePromise<{ url: string }>
        const result = await trpcPureClient.file.signMultipartPartUrl.mutate({
          appId,
          uploadId,
          key,
          partNumber,
        });
        if (!result.url) {
          throw new Error("Failed to sign part");
        }
        return {
          url: result.url,
        };
      },
      async completeMultipartUpload(file, { uploadId, key, parts }) {
        // 返回 MaybePromise<{ location: string }>
        const result = await trpcPureClient.file.completeMultipartUpload.mutate({
          uploadId,
          key,
          parts,
          appId,
        });
        if (!result.location) {
          throw new Error("Failed to complete multipart upload");
        }
        return {
          location: result.location,
        };
      },
      async abortMultipartUpload(file, { uploadId, key }) {
        // 返回 MaybePromise<void>
        try {
          await trpcPureClient.file.abortMultipartUpload.mutate({
            uploadId: uploadId!,
            key: key!,
            appId,
          });
          console.log("Multipart upload aborted");
        } catch (err) {
          console.error("Failed to abort multipart upload:", err);
        }
      },

      async getUploadParameters(file) {
        const result = await trpcPureClient.file.createPresignedUrl.mutate({
          filename: file.data instanceof File ? file.data.name : "test",
          contentType: file.data.type || "",
          size: file.size ?? 0,
          appId: appId,
        });
        return result;
      },
    });

    return uppy;
  });

  return uppy;
}
