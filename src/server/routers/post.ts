import { z } from "zod";
import { planet, prisma, procedure, trpcRouter } from "../trpc";
import { Post, User } from "@prisma/client";

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
    .query(async (opts) => {
      const { input } = opts;
      const limit = input.limit ?? 50;
      const { cursor, lat, lng } = input;
      const km = 10;
      const lowerLatitude = lat - (km / 6371) * (180 / Math.PI);
      const upperLatitude = lat + (km / 6371) * (180 / Math.PI);
      const lowerLongitude =
        lng - ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
      const upperLongitude =
        lng + ((km / 6371) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
      const cursorCondition = cursor ? `AND Post.id < ${cursor}` : "";
      const sqlQuery = `SELECT Post.id, Post.title, Post.createdAt, Post.content,
        User.name, User.username, User.latitude, User.longitude
        FROM Post INNER JOIN User ON Post.authorId = User.id
        WHERE User.latitude >= ${lowerLatitude}
            AND User.latitude <= ${upperLatitude}
            AND User.longitude >= ${lowerLongitude}
            AND User.longitude <= ${upperLongitude}
            AND ST_Distance_Sphere(
                POINT(User.longitude, User.latitude),
                POINT(${lng}, ${lat})) <= ${km * 1000}
            ${cursorCondition}
        ORDER BY Post.id DESC
        LIMIT ${limit + 1}
        `;
      console.log("query", sqlQuery);
      const res = await planet.execute(sqlQuery);
      const posts = res.rows as (User & Post)[];
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
        title: z.string().min(3).max(100).optional(),
        content: z.string().min(3).max(1000),
        authorId: z.number(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      const { title, content, authorId } = input;
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId,
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