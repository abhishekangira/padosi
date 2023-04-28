import { PostCard } from "../PostCard/PostCard";
import { fetchPosts } from "@/lib/firebase/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "../PostCard/PostCardSkeleton";
import { useUserContext } from "@/lib/contexts/user-context";

export function PostList() {
  const { user } = useUserContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) =>
      fetchPosts({ pageParam, center: [user?.location.lat!, user?.location.lng!] }),
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });

  console.log(data, "data");

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
  const posts = data.pages.flatMap((page) => page.posts);

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
          rangeChanged={(range) => {
            sessionStorage.setItem("startIndex", range.startIndex.toString());
          }}
          initialTopMostItemIndex={Number(sessionStorage.getItem("startIndex")) || 0}
          data={posts}
          endReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          overscan={20}
          itemContent={(index, post) => {
            return <PostCard key={post.id} post={post} index={index} />;
          }}
          components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
        />
      ) : (
        <span>no posts in your area!</span>
      )}
    </div>
  );
}
