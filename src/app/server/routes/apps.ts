import z from "zod";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { TRPCError } from "@trpc/server";
import { createAppSchema } from "../db/validate-schema";
import { protectedProcedure, router } from "../trpc";
import { db } from "../db/db";
import { apps, storageConfiguration } from "../db/schema";

export const appsRouter = router({
  createApp: protectedProcedure
    .input(createAppSchema.pick({ name: true, description: true }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(apps)
        .values({
          id: uuid(),
          name: input.name,
          description: input.description,
          userId: ctx.session.user.id,
        })
        .returning();

      return result[0];
    }),

  listApps: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.apps.findMany({
      where: (apps, { eq, and, isNull }) =>
        and(eq(apps.userId, ctx.session.user.id), isNull(apps.deletedAt)),
      orderBy: [desc(apps.createdAt)],
    });

    return result;
  }),

  changeStorage: protectedProcedure
    .input(z.object({ appId: z.string(), storageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const storage = await db.query.storageConfiguration.findFirst({
        where: (storages, { eq }) =>
          eq(storageConfiguration.id, input.storageId),
      });

      if (storage?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      await db
        .update(apps)
        .set({
          storageId: input.storageId,
        })
        .where(
          and(eq(apps.id, input.appId), eq(apps.userId, ctx.session.user.id))
        );
    }),
});
