import { PostCard } from "../PostCard/PostCard";
import { fetchPosts } from "@/lib/firebase/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

export function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });

  console.log(data, "data");

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") {
    console.error(error);
    return <div>There was an error</div>;
  }
  const posts = data.pages.flatMap((page) => page.posts);

  return posts.length ? (
    <Virtuoso
      useWindowScroll
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
