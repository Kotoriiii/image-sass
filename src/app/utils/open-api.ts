import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { type OpenRouter } from "@/server/open-router";

export const apiClient = createTRPCClient<OpenRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_TRPC_URL!,
    }),
  ],
});

export { OpenRouter };
