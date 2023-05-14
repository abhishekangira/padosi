import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";

export const userRouter = trpcRouter({
  create: procedure
    .input(
      z.object({
        username: z.string().min(3).max(20),
        uid: z.string(),
        email: z.string().email(),
        name: z.string().min(1).max(35),
        longitude: z.number(),
        latitude: z.number(),
        photo: z.string().url().nullish(),
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
  get: procedure
    .input(
      z.object({
        uid: z.string().optional(),
        id: z.number().optional(),
        username: z.string().optional(),
        currentUserId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ uid: input?.uid }, { id: input?.id }, { username: input?.username }],
        },
        include: {
          _count: {
            select: { followers: true, following: true, posts: true },
          },
          followers: {
            where: {
              OR: [{ followerId: input?.currentUserId }, { followingId: input?.currentUserId }],
            },
          },
        },
      });
      return user;
    }),
  update: procedure
    .input(
      z.object({
        id: z.number(),
        username: z.string().min(3).max(20),
        email: z.string().email(),
        name: z.string().min(1).max(35),
        longitude: z.number(),
        latitude: z.number(),
        photo: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, username, email, name, longitude, latitude, photo } = input;
      const user = await ctx.prisma.user.update({
        where: { id },
        data: {
          username,
          email,
          name,
          longitude,
          latitude,
          photo,
        },
      });
      return user;
    }),
  togglefollow: procedure
    .input(
      z.object({
        followerId: z.number(),
        followingId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { followerId, followingId } = input;
      const follow = await ctx.prisma.follow.findFirst({
        where: {
          followerId,
          followingId,
        },
      });
      if (follow) {
        await ctx.prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });
      } else {
        await ctx.prisma.follow.create({
          data: {
            followerId,
            followingId,
          },
        });
      }
      return { success: true };
    }),
});
