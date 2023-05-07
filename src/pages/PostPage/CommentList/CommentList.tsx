import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "../../HomePage/PostList/PostCard/PostCardSkeleton";
import { trpc } from "@/lib/utils/trpc";
import { CommentCard } from "./CommentCard";

export function CommentList({ commentsData }: { commentsData: any }) {
  const {
    data,
    isLoading: commentsLoading,
    isError: commentsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = commentsData;

  if (commentsLoading)
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </>
    );

  if (commentsError) {
    return <div>There was an error</div>;
  }

  const comments = data.pages.flatMap((page: any) => page.comments) || [];

  return (
    <div>
      {comments.length ? (
        <Virtuoso
          useWindowScroll
          data={comments}
          endReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          overscan={20}
          itemContent={(index, comment) => {
            return <CommentCard key={comment.id} comment={comment} />;
          }}
          components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
        />
      ) : null}
    </div>
  );
}
