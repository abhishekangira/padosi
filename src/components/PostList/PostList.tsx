import { useApi } from "@/lib/hooks/useApi";
import { PostCard } from "../PostCard/PostCard";
import { fetchPosts } from "@/lib/firebase/posts";
import { useInfiniteQuery } from "@tanstack/react-query";

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

  console.log("posts", data);

  return (
    <div className="flex-col">
      {posts.length
        ? posts.map((post) => <PostCard key={post.id} post={post} />)
        : "no posts in your area!"}
      {hasNextPage && (
        <button className="btn-primary btn" onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? "Loading" : "Load More"}
        </button>
      )}
    </div>
  );
}
