import { useApi } from "@/lib/hooks/useApi";
import { PostCard } from "../PostCard/PostCard";
import { getPosts } from "@/lib/firebase/posts";

export function PostList() {
  const { data, loading, error, fetchMore, hasMore } = useApi<"query">("query", getPosts);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error(error);
    return <div>There was an error</div>;
  }

  return (
    <div className="flex-col">
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <button className="btn-primary btn" onClick={() => fetchMore()}>
          Load More
        </button>
      )}
    </div>
  );
}
