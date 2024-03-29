import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";
import { Post, Prisma, User } from "@prisma/client";
import { usernameRegex } from "@/pages/SetLocationPage/SetLocationPage";

export const postRouter = trpcRouter({
  getInfinite: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        currentUserId: z.number(),
        userLat: z.number(),
        userLon: z.number(),
        sortBy: z.enum(["LATEST", "FOLLOWING"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor, userLat, userLon, currentUserId, sortBy } = input;
      const km = 20;
      const lowerLatitude = userLat - (km / 6371) * (180 / Math.PI);
      const upperLatitude = userLat + (km / 6371) * (180 / Math.PI);
      const lowerLongitude =
        userLon - ((km / 6371) * (180 / Math.PI)) / Math.cos((userLat * Math.PI) / 180);
      const upperLongitude =
        userLon + ((km / 6371) * (180 / Math.PI)) / Math.cos((userLat * Math.PI) / 180);

      const followingCondition =
        sortBy === "FOLLOWING" ? `AND Follow.followerId = ${currentUserId}` : "";

      const cursorCondition = cursor ? `AND Post.id <= ${cursor}` : "";

      const sqlQuery = `SELECT Post.id, Post.cuid, Post.title, Post.createdAt, Post.content, Post.authorId,
        User.name, User.username, User.latitude, User.longitude, User.photo, User.tagline,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'LIKE') AS likesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'DISLIKE') AS dislikesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${currentUserId} AND LikeDislike.type = 'LIKE') AS isLikedByUser,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${currentUserId} AND LikeDislike.type = 'DISLIKE') AS isDislikedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = ${currentUserId} AND Follow.followingId = Post.authorId) AS isFollowedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = Post.authorId AND Follow.followingId = ${currentUserId}) AS isFollowingUser,
        COUNT(DISTINCT Comment.id) AS commentsCount
        FROM Post
        INNER JOIN User ON Post.authorId = User.id
        LEFT JOIN Comment ON Post.id = Comment.postId
        LEFT JOIN Follow ON Post.authorId = Follow.followingId
        WHERE User.latitude >= ${lowerLatitude}
        AND User.latitude <= ${upperLatitude}
        AND User.longitude >= ${lowerLongitude}
        AND User.longitude <= ${upperLongitude}
        AND ST_Distance_Sphere(
            POINT(User.longitude, User.latitude),
            POINT(${userLon}, ${userLat})) <= ${km * 1000}
        ${followingCondition}
        ${cursorCondition}
        GROUP BY Post.id
        ORDER BY Post.id DESC
        LIMIT ${limit + 1};
        `;
      // console.log(sqlQuery);

      const res = await ctx.planet.execute(sqlQuery);
      console.log(res.rows);

      const posts = mapPosts(res.rows);

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
  create: procedure
    .input(
      z.object({
        title: z.string().min(1).max(150).nullish(),
        content: z.string().min(1).max(1000),
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
  get: procedure
    .input(
      z.object({
        cuid: z.string().cuid(),
        currentUserId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const sqlQuery = `SELECT Post.id, Post.cuid, Post.title, Post.createdAt, Post.content, Post.authorId,
        User.name, User.username, User.latitude, User.longitude, User.photo, User.tagline,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'LIKE') AS likesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'DISLIKE') AS dislikesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${input.currentUserId} AND LikeDislike.type = 'LIKE') AS isLikedByUser,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${input.currentUserId} AND LikeDislike.type = 'DISLIKE') AS isDislikedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = ${input.currentUserId} AND Follow.followingId = Post.authorId) AS isFollowedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = Post.authorId AND Follow.followingId = ${input.currentUserId}) AS isFollowingUser,
        COUNT(DISTINCT Comment.id) AS commentsCount
        FROM Post
        INNER JOIN User ON Post.authorId = User.id
        LEFT JOIN Comment ON Post.id = Comment.postId
        WHERE Post.cuid = '${input.cuid}'
        GROUP BY Post.id
      `;
      const res = await ctx.planet.execute(sqlQuery);
      const post = mapPosts(res.rows)[0];
      return post || null;
    }),
  delete: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleteLikeDislikes = ctx.prisma.likeDislike.deleteMany({
        where: {
          postId: input.id,
        },
      });
      const deleteComments = ctx.prisma.comment.deleteMany({
        where: {
          postId: input.id,
        },
      });
      const deletePost = ctx.prisma.post.delete({
        where: {
          id: input.id,
        },
      });
      return await ctx.prisma.$transaction([deleteLikeDislikes, deleteComments, deletePost]);
    }),
  getInfiniteOfUser: procedure
    .input(
      z.object({
        currentUserId: z.number(),
        username: z.string().regex(usernameRegex),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = 20;
      const sqlQuery = `SELECT Post.id, Post.cuid, Post.title, Post.createdAt, Post.content, Post.authorId,
        User.name, User.username, User.latitude, User.longitude, User.photo, User.tagline,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'LIKE') AS likesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'DISLIKE') AS dislikesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${
          input.currentUserId
        } AND LikeDislike.type = 'LIKE') AS isLikedByUser,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${
          input.currentUserId
        } AND LikeDislike.type = 'DISLIKE') AS isDislikedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = ${
          input.currentUserId
        } AND Follow.followingId = Post.authorId) AS isFollowedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = Post.authorId AND Follow.followingId = ${
          input.currentUserId
        }) AS isFollowingUser,
        COUNT(DISTINCT Comment.id) AS commentsCount
        FROM Post
        INNER JOIN User ON Post.authorId = User.id
        LEFT JOIN Comment ON Post.id = Comment.postId
        WHERE User.username = '${input.username}'
        ${input.cursor ? `AND Post.id <= ${input.cursor}` : ""}
        GROUP BY Post.id
        ORDER BY Post.id DESC
        LIMIT ${limit + 1};
      `;

      const res = await ctx.planet.execute(sqlQuery);
      // console.log("response", res.rows);

      const posts = mapPosts(res.rows);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),
});

export function mapPosts(rows: any[]) {
  return rows.map((post) => {
    const {
      id,
      cuid,
      title,
      createdAt,
      content,
      name,
      photo,
      username,
      latitude,
      longitude,
      authorId,
      likesCount,
      dislikesCount,
      isLikedByUser,
      isDislikedByUser,
      commentsCount,
      tagline,
      isFollowedByUser,
      isFollowingUser,
    } = post as any;
    return {
      id,
      cuid,
      title,
      createdAt,
      content,
      authorId,
      likesCount: +likesCount,
      dislikesCount: +dislikesCount,
      isLikedByUser: !!+isLikedByUser,
      isDislikedByUser: !!+isDislikedByUser,
      commentsCount: +commentsCount,
      isFollowedByUser: !!+isFollowedByUser,
      isFollowingUser: !!+isFollowingUser,
      author: { name, username, latitude, longitude, photo, tagline },
    };
  }) as (Post & {
    author: User;
    likesCount: number;
    dislikesCount: number;
    isLikedByUser: boolean;
    isDislikedByUser: boolean;
    commentsCount: number;
    isFollowedByUser: boolean;
    isFollowingUser: boolean;
  })[];
}

/* Sort by distance
infinitePosts: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z
          .object({
            id: z.number(),
            distance: z.number(),
          })
          .nullish(),
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
      const cursorCondition = cursor?.id ? `AND Post.id < ${cursor?.id}` : "";
      const sqlQuery = `SELECT Post.id, Post.title, Post.createdAt, Post.content,
        User.name, User.username, User.latitude, User.longitude,
        ST_Distance_Sphere(
            POINT(User.longitude, User.latitude),
            POINT(${lng}, ${lat})
        ) AS distance
        FROM Post INNER JOIN User ON Post.authorId = User.id
        WHERE User.latitude >= ${lowerLatitude}
            AND User.latitude <= ${upperLatitude}
            AND User.longitude >= ${lowerLongitude}
            AND User.longitude <= ${upperLongitude}
            AND ST_Distance_Sphere(
                POINT(User.longitude, User.latitude),
                POINT(${lng}, ${lat})) <= ${km * 1000}
            AND (
                ST_Distance_Sphere(
                POINT(User.longitude, User.latitude),
                POINT(${lng}, ${lat})) > ${cursor?.distance ?? 0}
                OR  (
                    ST_Distance_Sphere(
                    POINT(User.longitude, User.latitude),
                    POINT(${lng}, ${lat})) = ${cursor?.distance ?? 0}
                    ${cursorCondition}
                    )
                )
        ORDER BY distance ASC, Post.id DESC
        LIMIT ${limit + 1}
        `;
      console.log("query", sqlQuery);
      const res = await planet.execute(sqlQuery);
      const posts = res.rows as (User & Post & { distance: number })[];
      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = { id: nextItem!.id, distance: nextItem!.distance };
      }

      return {
        posts,
        nextCursor,
      };
    }), */
