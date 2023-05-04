import { procedure, trpcRouter } from "../trpc";
import { z } from "zod";
import { postRouter } from "./post";
import { userRouter } from "./user";

const toggleLikeDislike = procedure
  .input(
    z.object({
      userId: z.number(),
      postId: z.number().optional(),
      commentId: z.number().optional(),
      action: z.enum(["LIKE", "DISLIKE"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId, postId, commentId, action } = input;
    const existingLikeDislike = await ctx.prisma.likeDislike.findFirst({
      where: {
        userId,
        postId,
        commentId,
      },
    });

    if (existingLikeDislike) {
      if (existingLikeDislike.type === action) {
        await ctx.prisma.likeDislike.delete({ where: { id: existingLikeDislike.id } });
      } else {
        await ctx.prisma.likeDislike.update({
          where: { id: existingLikeDislike.id },
          data: { type: action },
        });
      }
    } else {
      await ctx.prisma.likeDislike.create({
        data: {
          userId,
          postId,
          commentId,
          type: action,
          entity: postId ? "POST" : "COMMENT",
        },
      });
    }

    return { success: true };
  });

export const appRouter = trpcRouter({
  post: postRouter,
  user: userRouter,
  toggleLikeDislike,
});

export type AppRouter = typeof appRouter;
