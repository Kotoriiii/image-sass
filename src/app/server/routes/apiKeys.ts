import z from "zod";
import { v4 as uuid } from "uuid";
import { TRPCError } from "@trpc/server";
import { db } from "../db/db";
import { apiKeys, apps, storageConfiguration } from "../db/schema";
import { protectedProcedure, router } from "../trpc";

export const apiKeysRouter = router({
  listapiKeys: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.query.apiKeys.findMany({
        where: (apiKeys, { eq, and, isNull }) =>
          and(eq(apiKeys.appId, input.appId), isNull(apiKeys.deletedAt)),
        columns: {
          key: false,
        },
      });
    }),

  requestKey: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const apiKey = await db.query.apiKeys.findFirst({
        where: (apiKeys, { eq, isNull, and }) =>
          and(eq(apiKeys.id, input), isNull(apiKeys.deletedAt)),
        with: {
          app: {
            with: {
              user: true,
            },
          },
        },
      });

      if (apiKey?.app.user.id !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return apiKey?.key;
    }),

  createApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        appId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .insert(apiKeys)
        .values({
          name: input.name,
          appId: input.appId,
          key: uuid(),
          clientId: uuid(),
        })
        .returning();

      return result[0];
    }),
});
