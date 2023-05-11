import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";

export const searchRouter = trpcRouter({
  posts: procedure
    .input(
      z.object({
        searchTerm: z.string().min(3).max(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { searchTerm } = input;
      const posts = await ctx.prisma.post.findMany({
        where: {
          OR: [
            {
              title: {
                search: searchTerm,
              },
            },
            {
              content: {
                search: searchTerm,
              },
            },
          ],
        },
        include: {
          author: true,
        },
      });
      return posts;
    }),
});
