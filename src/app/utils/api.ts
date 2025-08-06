import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";

export const trpcClientReact = createTRPCReact<AppRouter>({});

export const trpcClient = trpcClientReact.createClient({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_TRPC_URL!,
    }),
  ],
});

export const trpcPureClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_TRPC_URL!,
    }),
  ],
});

export { AppRouter };
