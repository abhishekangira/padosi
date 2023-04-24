import { PostCard } from "../PostCard/PostCard";
import { fetchPosts } from "@/lib/firebase/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Virtuoso } from "react-virtuoso";

export function PostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts({ pageParam }),
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") {
    console.error(error);
    return <div>There was an error</div>;
  }
  const posts = data.pages.flatMap((page) => page.posts);

  // posts.map((post) => <PostCard key={post.id} post={post} />

  return (
    <div className="flex-col">
      {posts.length ? (
        <Virtuoso
          useWindowScroll
          data={posts}
          endReached={() => fetchNextPage()}
          overscan={200}
          itemContent={(index, post) => {
            return <PostCard key={post.id} post={post} />;
          }}
          components={{ Footer: () => (isFetchingNextPage ? <div>Loading...</div> : null) }}
        />
      ) : (
        "no posts in your area!"
      )}
    </div>
  );
}
