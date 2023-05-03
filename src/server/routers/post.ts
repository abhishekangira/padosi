import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";
import { Post, Prisma, User } from "@prisma/client";

export const postRouter = trpcRouter({
  infinitePosts: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        lat: z.number(),
        lng: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor, lat, lng } = input;
      const km = 20;
      const lowerLatitude = lat - (km / 6371) * (180 / Math.PI);
      const upperLatitude = lat + (km / 6371) * (180 / Math.PI);
      const lowerLongitude =
        lng - ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
      const upperLongitude =
        lng + ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);

      const sqlQuery = `SELECT Post.id, Post.cuid, Post.title, Post.createdAt, Post.content,
        User.name, User.username, User.latitude, User.longitude, User.id as authorId
        FROM Post INNER JOIN User ON Post.authorId = User.id
        WHERE User.latitude >= ${lowerLatitude}
            AND User.latitude <= ${upperLatitude}
            AND User.longitude >= ${lowerLongitude}
            AND User.longitude <= ${upperLongitude}
            AND ST_Distance_Sphere(
                POINT(User.longitude, User.latitude),
                POINT(${lng}, ${lat})) <= ${km * 1000}
            AND Post.id < ${cursor || Number.MAX_SAFE_INTEGER}
        ORDER BY Post.id DESC
        LIMIT ${limit + 1}
        `;

      const res = await ctx.planet.execute(sqlQuery);
      const posts = res.rows.map((post) => {
        const {
          id,
          cuid,
          title,
          createdAt,
          content,
          name,
          username,
          latitude,
          longitude,
          authorId,
        } = post as User & Post & { authorId: number };
        return {
          id,
          cuid,
          title,
          createdAt,
          content,
          authorId,
          author: { name, username, latitude, longitude },
        };
      }) as (Post & { author: User })[];

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),
  createPost: procedure
    .input(
      z.object({
        title: z.string().min(3).max(150).nullish(),
        content: z.string().min(3).max(1000),
        authorId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, authorId } = input;
      const post = await ctx.prisma.post.create({
        data: {
          title,
          content,
          authorId,
        },
      });
      return post;
    }),
  getPost: procedure
    .input(
      z.object({
        cuid: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          cuid: input.cuid,
        },
        include: {
          author: true,
        },
      });
      return post;
    }),
});

// Sort by distance

// infinitePosts: procedure
//     .input(
//       z.object({
//         limit: z.number().min(1).max(100).nullish(),
//         cursor: z
//           .object({
//             id: z.number(),
//             distance: z.number(),
//           })
//           .nullish(),
//         lat: z.number(),
//         lng: z.number(),
//       })
//     )
//     .query(async (opts) => {
//       const { input } = opts;
//       const limit = input.limit ?? 50;
//       const { cursor, lat, lng } = input;
//       const km = 10;
//       const lowerLatitude = lat - (km / 6371) * (180 / Math.PI);
//       const upperLatitude = lat + (km / 6371) * (180 / Math.PI);
//       const lowerLongitude =
//         lng - ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
//       const upperLongitude =
//         lng + ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
//       const cursorCondition = cursor?.id ? `AND Post.id < ${cursor?.id}` : "";
//       const sqlQuery = `SELECT Post.id, Post.title, Post.createdAt, Post.content,
//         User.name, User.username, User.latitude, User.longitude,
//         ST_Distance_Sphere(
//             POINT(User.longitude, User.latitude),
//             POINT(${lng}, ${lat})
//         ) AS distance
//         FROM Post INNER JOIN User ON Post.authorId = User.id
//         WHERE User.latitude >= ${lowerLatitude}
//             AND User.latitude <= ${upperLatitude}
//             AND User.longitude >= ${lowerLongitude}
//             AND User.longitude <= ${upperLongitude}
//             AND ST_Distance_Sphere(
//                 POINT(User.longitude, User.latitude),
//                 POINT(${lng}, ${lat})) <= ${km * 1000}
//             AND (
//                 ST_Distance_Sphere(
//                 POINT(User.longitude, User.latitude),
//                 POINT(${lng}, ${lat})) > ${cursor?.distance ?? 0}
//                 OR  (
//                     ST_Distance_Sphere(
//                     POINT(User.longitude, User.latitude),
//                     POINT(${lng}, ${lat})) = ${cursor?.distance ?? 0}
//                     ${cursorCondition}
//                     )
//                 )
//         ORDER BY distance ASC, Post.id DESC
//         LIMIT ${limit + 1}
//         `;
//       console.log("query", sqlQuery);
//       const res = await planet.execute(sqlQuery);
//       const posts = res.rows as (User & Post & { distance: number })[];
//       let nextCursor: typeof cursor | undefined = undefined;
//       if (posts.length > limit) {
//         const nextItem = posts.pop();
//         nextCursor = { id: nextItem!.id, distance: nextItem!.distance };
//       }

//       return {
//         posts,
//         nextCursor,
//       };
//     }),
