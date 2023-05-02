import { trpcRouter } from "../trpc";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = trpcRouter({
  post: postRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
