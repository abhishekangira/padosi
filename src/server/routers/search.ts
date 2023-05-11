import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";
import { mapPosts } from "./post";

export const searchRouter = trpcRouter({
  posts: procedure
    .input(
      z.object({
        searchTerm: z.string().min(3).max(50),
        cursor: z.number().nullish(),
        userId: z.number(),
        userLat: z.number(),
        userLon: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { searchTerm, cursor, userId, userLat, userLon } = input;
      const limit = 20;
      const km = 20;
      const lowerLatitude = userLat - (km / 6371) * (180 / Math.PI);
      const upperLatitude = userLat + (km / 6371) * (180 / Math.PI);
      const lowerLongitude =
        userLon - ((km / 6371) * (180 / Math.PI)) / Math.cos((userLat * Math.PI) / 180);
      const upperLongitude =
        userLon + ((km / 6371) * (180 / Math.PI)) / Math.cos((userLat * Math.PI) / 180);
      const cursorCondition = cursor ? `AND Post.id <= ${cursor}` : "";

      const sqlQuery = `SELECT Post.id, Post.cuid, Post.title, Post.createdAt, Post.content, Post.authorId,
        User.name, User.username, User.latitude, User.longitude, User.photo, User.tagline,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'LIKE') AS likesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.type = 'DISLIKE') AS dislikesCount,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${userId} AND LikeDislike.type = 'LIKE') AS isLikedByUser,
        (SELECT COUNT(*) FROM LikeDislike WHERE LikeDislike.postId = Post.id AND LikeDislike.userId = ${userId} AND LikeDislike.type = 'DISLIKE') AS isDislikedByUser,
        COUNT(DISTINCT Comment.id) AS commentsCount
        FROM Post
        INNER JOIN User ON Post.authorId = User.id
        LEFT JOIN Comment ON Post.id = Comment.postId
        WHERE User.latitude >= ${lowerLatitude}
        AND User.latitude <= ${upperLatitude}
        AND User.longitude >= ${lowerLongitude}
        AND User.longitude <= ${upperLongitude}
        AND ST_Distance_Sphere(
            POINT(User.longitude, User.latitude),
            POINT(${userLon}, ${userLat})) <= ${km * 1000}
        AND MATCH(Post.title, Post.content) AGAINST ('* ${searchTerm} *' IN NATURAL LANGUAGE MODE)
        ${cursorCondition}
        GROUP BY Post.id
        ORDER BY Post.id DESC
        LIMIT ${limit + 1};
        `;
      console.log(sqlQuery);

      const res = await ctx.planet.execute(sqlQuery);
      // console.log(res.rows);

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
});
