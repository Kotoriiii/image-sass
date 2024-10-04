import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { storageConfiguration } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

export const storagesRouter = router({
  listStorages: protectedProcedure.query(async ({ ctx }) => {
    return db.query.storageConfiguration.findMany({
      where: (storages, { eq, and, isNull }) =>
        and(
          eq(storages.userId, ctx.session.user.id),
          isNull(storages.deletedAt)
        ),
    });
  }),

  createStorage: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        bucket: z.string(),
        region: z.string(),
        accessKeyId: z.string(),
        secretAccessKey: z.string(),
        apiEndpoint: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, ...configuration } = input;

      const result = await db
        .insert(storageConfiguration)
        .values({
          name: input.name,
          configuration: configuration,
          userId: ctx.session.user.id,
        })
        .returning();

      return result[0];
    }),

  deleteStorage: protectedProcedure
    .input(
      z.object({
        storageId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db
        .update(storageConfiguration)
        .set({ deletedAt: new Date() })
        .where(eq(storageConfiguration.id, input.storageId));
    }),
});
