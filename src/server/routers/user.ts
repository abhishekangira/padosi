import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";

export const userRouter = trpcRouter({
  createUser: procedure
    .input(
      z.object({
        username: z.string().min(3).max(20),
        uid: z.string(),
        email: z.string().email(),
        name: z.string().max(191),
        longitude: z.number(),
        latitude: z.number(),
        photo: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { username, uid, email, name, longitude, latitude, photo } = input;
      const user = await ctx.prisma.user.create({
        data: {
          username,
          uid,
          email,
          name,
          longitude,
          latitude,
          photo,
        },
      });
      return user;
    }),
  getUser: procedure
    .input(
      z.object({
        uid: z.string().optional(),
        id: z.number().optional(),
        username: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ uid: input?.uid }, { id: input?.id }, { username: input?.username }],
        },
      });
      return user;
    }),
});
