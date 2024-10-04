import { appRouter } from "@/server/router";
import { createCallerFactory } from "@trpc/server";

export const serverCaller = createCallerFactory()(appRouter);
