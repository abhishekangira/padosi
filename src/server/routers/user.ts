import { z } from "zod";
import { prisma, procedure, trpcRouter } from "../trpc";

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
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      const { username, uid, email, name, longitude, latitude } = input;
      const user = await prisma.user.create({
        data: {
          username,
          uid,
          email,
          name,
          longitude,
          latitude,
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
    .query(async (opts) => {
      const { input } = opts;
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ uid: input?.uid }, { id: input?.id }, { username: input.username }],
        },
      });
      return user;
    }),
});
