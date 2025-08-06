import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";

export const serverCaller = createCallerFactory(appRouter);
