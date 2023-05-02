import { PostCard } from "../PostCard/PostCard";
import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "../PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { Post, User } from "@prisma/client";

export function PostList() {
  const { user } = useUserContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    trpc.post.infinitePosts.useInfiniteQuery(
      {
        limit: 10,
        lat: user!?.latitude,
        lng: user!?.longitude,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!user?.id,
      }
    );
  console.log(
    "data",
    data?.pages.flatMap((page) => page.posts)
  );

  if (status === "loading")
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </>
    );
  if (status === "error") {
    console.error(error);
    return <div>There was an error</div>;
  }
  const posts = data.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="tabs self-center">
        <a className="tab tab-bordered tab-active">Latest</a>
        <a className="tab tab-bordered">Top</a>
        <a className="tab tab-bordered">Following</a>
      </div>
      {posts.length ? (
        <Virtuoso
          useWindowScroll
          data={posts}
          endReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          overscan={20}
          itemContent={(index, post) => {
            return <PostCard key={post.id} post={post as unknown as User & Post} index={index} />;
          }}
          components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
        />
      ) : (
        <span>no posts in your area!</span>
      )}
    </div>
  );
}
