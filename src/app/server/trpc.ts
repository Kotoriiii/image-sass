import { headers } from "next/headers";
import { initTRPC, TRPCError } from "@trpc/server";
import jwt, { JwtPayload } from "jsonwebtoken";

import { getServerSession } from "@/server/auth";
import { db } from "./db/db";

const t = initTRPC.context().create();

const { router, procedure, createCallerFactory } = t;

export const withLoggerProcedure = procedure.use(async ({ next }) => {
  const start = Date.now();

  const result = await next();

  console.log("---> Api time:", Date.now() - start);

  return result;
});

export const withSessionMiddleware = t.middleware(async ({ next }) => {
  const session = await getServerSession();

  return next({
    ctx: { session },
  });
});

export const protectedProcedure = withLoggerProcedure.use(withSessionMiddleware).use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  return next({
    ctx: {
      session: ctx.session!,
    },
  });
});

export const withAppProcedure = withLoggerProcedure.use(async ({ next }) => {
  const header = await headers();

  const apiKey = header.get("api-Key");
  const signedToken = header.get("signed-Token");

  if (apiKey) {
    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNull }) => and(eq(apiKeys.key, apiKey), isNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: true,
            storage: true,
          },
        },
      },
    });

    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user,
      },
    });
  } else if (signedToken) {
    const payload = jwt.decode(signedToken);

    if (!(payload as JwtPayload)?.clientId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "clientId not found",
      });
    }

    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNull }) =>
        and(eq(apiKeys.clientId, (payload as JwtPayload).clientId), isNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: true,
            storage: true,
          },
        },
      },
    });

    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    try {
      jwt.verify(signedToken, apiKeyAndAppUser.key);
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "token invalid",
        cause: err,
      });
    }

    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user,
      },
    });
  }

  throw new TRPCError({
    code: "FORBIDDEN",
  });
});

export { router, createCallerFactory };
