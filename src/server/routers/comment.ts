import { z } from "zod";
import { procedure, trpcRouter } from "../trpc";
import { Comment, User } from "@prisma/client";

export const commentRouter = trpcRouter({
  getInfinite: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        postCuid: z.string().cuid(),
        currentUserId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 20;
      const { cursor, postCuid, currentUserId } = input;

      const sqlQuery = `SELECT Comment.id, Comment.createdAt, Comment.content, Comment.authorId, Comment.postCuid, Comment.postId,
        User.name, User.username, User.latitude, User.longitude, User.photo,
        SUM(CASE WHEN LikeDislike.type = 'LIKE' THEN 1 ELSE 0 END) AS likesCount,
        SUM(CASE WHEN LikeDislike.type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikesCount,
        SUM(CASE WHEN LikeDislike.userId = ${currentUserId} AND LikeDislike.type = 'LIKE' THEN 1 ELSE 0 END) AS isLikedByUser,
        SUM(CASE WHEN LikeDislike.userId = ${currentUserId} AND LikeDislike.type = 'DISLIKE' THEN 1 ELSE 0 END) AS isDislikedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = ${currentUserId} AND Follow.followingId = Comment.authorId) AS isFollowedByUser,
        (SELECT COUNT(*) FROM Follow WHERE Follow.followerId = Comment.authorId AND Follow.followingId = ${currentUserId}) AS isFollowingUser
        FROM Comment
        INNER JOIN User ON Comment.authorId = User.id
        LEFT JOIN LikeDislike ON Comment.id = LikeDislike.commentId
        WHERE Comment.postCuid = '${postCuid}'
        ${cursor ? `AND Comment.id <= ${cursor}` : ""}
        GROUP BY Comment.id
        ORDER BY Comment.id DESC
        LIMIT ${limit + 1};
        `;

      const res = await ctx.planet.execute(sqlQuery);

      const comments = mapComments(res.rows);

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments,
        nextCursor,
      };
    }),
  add: procedure
    .input(
      z.object({
        content: z.string().min(1).max(500),
        authorId: z.number(),
        postId: z.number(),
        postCuid: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { content, authorId, postId, postCuid } = input;
      const post = await ctx.prisma.comment.create({
        data: {
          content,
          authorId,
          postId,
          postCuid,
        },
      });
      return post;
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
          commentId: input.id,
        },
      });
      const deleteComment = ctx.prisma.comment.delete({
        where: {
          id: input.id,
        },
      });
      return await ctx.prisma.$transaction([deleteLikeDislikes, deleteComment]);
    }),
});

function mapComments(rows: any[]) {
  return rows.map((comment) => {
    const {
      id,
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
      postCuid,
      postId,
      isFollowedByUser,
      isFollowingUser,
    } = comment as any;
    return {
      id,
      createdAt,
      content,
      authorId,
      postCuid,
      postId,
      likesCount: +likesCount,
      dislikesCount: +dislikesCount,
      isLikedByUser: !!+isLikedByUser,
      isDislikedByUser: !!+isDislikedByUser,
      isFollowedByUser: !!+isFollowedByUser,
      isFollowingUser: !!+isFollowingUser,
      author: { name, username, photo, latitude, longitude },
    };
  }) as (Comment & {
    author: User;
    likesCount: number;
    dislikesCount: number;
    isLikedByUser: boolean;
    isDislikedByUser: boolean;
    isFollowedByUser: boolean;
    isFollowingUser: boolean;
  })[];
}
