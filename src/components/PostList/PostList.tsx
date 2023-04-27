import { PostCard } from "../PostCard/PostCard";
import { fetchPosts } from "@/lib/firebase/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { PostCardSkeleton } from "../PostCard/PostCardSkeleton";

export function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });

  console.log(data, "data");

  if (status === "loading")
    return Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />);
  if (status === "error") {
    console.error(error);
    return <div>There was an error</div>;
  }
  const posts = data.pages.flatMap((page) => page.posts);

  return posts.length ? (
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
  );
}
