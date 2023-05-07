import { PostCard } from "./PostCard/PostCard";
import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "./PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";
import { trpc } from "@/lib/utils/trpc";
import { useState } from "react";

export function PostList({ sortBy }: { sortBy: "LATEST" | "TRENDING" }) {
  const { user } = useUserContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    trpc.post.getInfinite.useInfiniteQuery(
      {
        limit: 20,
        userLat: user!?.latitude,
        userLon: user!?.longitude,
        userId: user!?.id,
        sortBy,
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

  return posts.length ? (
    <Virtuoso
      useWindowScroll
      data={posts}
      endReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      overscan={20}
      itemContent={(index, post) => {
        return <PostCard key={post.cuid} post={post} />;
      }}
      components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
    />
  ) : (
    <span>no posts in your area!</span>
  );
}
