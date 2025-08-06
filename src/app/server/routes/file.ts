import z from "zod";
import { Session } from "next-auth";
import { v4 as uuid } from "uuid";
import { asc, desc, eq, isNull, sql, and } from "drizzle-orm";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  ListPartsCommand,
  AbortMultipartUploadCommand,
  PutObjectCommandInput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { files } from "../db/schema";
import { db } from "../db/db";
import { filesCanOrderByColumns } from "../db/validate-schema";
import S3ClientSingleton from "../S3ClientSingleton";

const getStorage = async (
  appId: string,
  ctx: {
    session: Session;
  }
) => {
  const app = await db.query.apps.findFirst({
    where: (apps, { eq }) => eq(apps.id, appId),
    with: {
      storage: true,
    },
  });

  if (!app || !app.storage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
    });
  }

  if (app.userId !== ctx.session.user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  const storage = app.storage;

  return storage;
};

const filesOrderByColumnSchema = z
  .object({
    field: filesCanOrderByColumns.keyof(),
    order: z.enum(["desc", "asc"]),
  })
  .optional();

export type FilesOrderByColumn = z.infer<typeof filesOrderByColumnSchema>;

export const filesRoutes = router({
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date();

      const isoString = date.toISOString();

      const dateString = isoString.split("T")[0];

      const storage = await getStorage(input.appId, ctx);

      const params: PutObjectCommandInput = {
        Bucket: storage.configuration.bucket,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
        ContentLength: input.size,
      };

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      return {
        url,
        method: "PUT" as const,
      };
    }),

  createMultipartUpload: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date();

      const isoString = date.toISOString();

      const dateString = isoString.split("T")[0];

      const storage = await getStorage(input.appId, ctx);

      // 初始化分块上传，返回 uploadId 和 key
      const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: storage.configuration.bucket,
        Key: `${dateString}/${input.filename.replaceAll(" ", "_")}`,
        ContentType: input.contentType,
      });

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      const multipartUpload = await s3Client.send(createMultipartUploadCommand);

      return {
        uploadId: multipartUpload.UploadId as string, // 返回 uploadId
        key: `${dateString}/${input.filename.replaceAll(" ", "_")}`, // 返回文件的 key
      };
    }),

  // 列出已经上传的分块
  listMultipartParts: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
        key: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storage = await getStorage(input.appId, ctx);

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      // 列出已上传的分块
      const command = new ListPartsCommand({
        Bucket: storage.configuration.bucket,
        Key: input.key,
        UploadId: input.uploadId,
      });

      const result = await s3Client.send(command);

      return {
        parts: result.Parts || [],
      };
    }),

  // 为每个分块生成预签名 URL
  signMultipartPartUrl: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
        key: z.string(),
        partNumber: z.number(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storage = await getStorage(input.appId, ctx);

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      // 生成用于上传分块的签名 URL
      const command = new UploadPartCommand({
        Bucket: storage.configuration.bucket,
        Key: input.key,
        PartNumber: input.partNumber,
        UploadId: input.uploadId,
      });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60,
      });

      return {
        url,
      };
    }),

  // 完成分块上传
  completeMultipartUpload: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
        key: z.string(),
        parts: z.array(
          z.object({
            ETag: z.string().optional(),
            PartNumber: z.number().optional(),
            Size: z.number().optional(),
          })
        ),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storage = await getStorage(input.appId, ctx);

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      // 完成分块上传，合并分块
      const command = new CompleteMultipartUploadCommand({
        Bucket: storage.configuration.bucket,
        Key: input.key,
        UploadId: input.uploadId,
        MultipartUpload: {
          Parts: input.parts,
        },
      });

      const result = await s3Client.send(command);

      return {
        location: result.Location,
        key: result.Key,
        bucket: result.Bucket,
      };
    }),

  abortMultipartUpload: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
        key: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storage = await getStorage(input.appId, ctx);

      const s3Client = S3ClientSingleton.getInstance({
        apiEndpoint: storage.configuration.apiEndpoint,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
      });

      // 调用 S3 的 AbortMultipartUploadCommand 取消多部分上传
      const command = new AbortMultipartUploadCommand({
        Bucket: storage.configuration.bucket,
        Key: input.key,
        UploadId: input.uploadId,
      });

      await s3Client.send(command);

      // 返回取消成功的消息
      return { message: "Multipart upload aborted successfully" };
    }),

  saveFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        path: z.string(),
        type: z.string(),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      const url = new URL(input.path);

      const photo = await db
        .insert(files)
        .values({
          ...input,
          id: uuid(),
          path: url.pathname,
          url: url.toString(),
          userId: session.user!.id!,
          contentType: input.type,
        })
        .returning();

      return photo[0];
    }),

  listFiles: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await db.query.files.findMany({
        orderBy: [desc(files.createdAt)],
        where: (files, { eq }) =>
          and(
            eq(files.userId, ctx.session.user.id),
            eq(files.appId, input.appId)
          ),
      });

      return result;
    }),

  infinityQueryFiles: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.string(),
          })
          .optional(),
        limit: z.number().default(10),
        orderBy: filesOrderByColumnSchema,
        appId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        cursor,
        limit,
        orderBy = { field: "createdAt", order: "desc" },
      } = input;

      const deletedFilter = isNull(files.deletedAt);
      const userFilter = eq(files.userId, ctx.session.user.id);
      const appFilter = eq(files.appId, input.appId);

      const statement = db
        .select()
        .from(files)
        .limit(limit)
        .where(
          cursor
            ? and(
                orderBy.field === "createdAt" && orderBy.order === "desc"
                  ? sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") < (${new Date(
                      cursor.createdAt
                    ).toISOString()}, ${cursor.id})`
                  : sql`(DATE_TRUNC('milliseconds',"files"."created_at"), "files"."id") > (${new Date(
                      cursor.createdAt
                    ).toISOString()}, ${cursor.id})`,
                deletedFilter,
                userFilter,
                appFilter
              )
            : and(deletedFilter, userFilter, appFilter)
        );

      statement.orderBy(
        orderBy.order === "desc"
          ? desc(files[orderBy.field])
          : asc(files[orderBy.field])
      );

      const result = await statement;

      return {
        items: result,
        nextCursor:
          result.length > 0
            ? {
                createdAt: result[result.length - 1].createdAt!,
                id: result[result.length - 1].id,
              }
            : null,
      };
    }),

  deleteFile: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return db
        .update(files)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(files.id, input));
    }),
});
