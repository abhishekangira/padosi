import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { TrpcContextType } from "../../pages/api/trpc/[trpc]";

const t = initTRPC.context<TrpcContextType>().create({
  transformer: superjson,
});

export const trpcRouter = t.router;
export const procedure = t.procedure;
